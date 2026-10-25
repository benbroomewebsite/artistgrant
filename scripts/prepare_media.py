"""Audit the live Squarespace site and create a deduplicated R2 staging folder.

Does not change the app, existing media, or remote storage.
"""
import concurrent.futures as futures
import hashlib
import html
import io
import json
import re
import shutil
import subprocess
import urllib.parse
import xml.etree.ElementTree as ET
from pathlib import Path
from PIL import Image, ImageOps
from import_squarespace_media import fetch, PageMediaParser, slugify, extension_for

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT.parent / 'artistgrant-media-prepared'
UPLOAD = OUT / 'upload'
OUT.mkdir(exist_ok=True)
UPLOAD.mkdir(exist_ok=True)
old = json.loads((ROOT / 'public/media/manifest.json').read_text('utf-8'))
sources = {}
errors = []
embeds = list(old.get('externalEmbeds', []))
configs = {}

def add(url, page, label=''):
    url = html.unescape(url).replace('\\/', '/')
    if url.startswith('//'): url = 'https:' + url
    if not url.startswith('https://'): return
    url = url.split('?', 1)[0].split('#', 1)[0]
    if url.endswith(('.css', '.js', '/')): return
    record = sources.setdefault(url, {'pages': set(), 'labels': set(), 'oldPaths': set()})
    record['pages'].add(page)
    if label: record['labels'].add(label)
    return record

for item in old['images']:
    add(item['sourceUrl'], item['pageUrl'], item.get('caption', ''))['oldPaths'].add(item['path'])

sitemap, _ = fetch(old['source'])
(OUT / 'source-sitemap.xml').write_bytes(sitemap)
tree = ET.fromstring(sitemap)
ns = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
pages = [x.text for x in tree.findall('s:url/s:loc', ns)]

def crawl(page):
    payload, _ = fetch(page)
    markup = payload.decode('utf-8', errors='replace')
    parser = PageMediaParser()
    parser.feed(markup)
    # Includes lazy images, srcsets, social previews, CSS backgrounds and JSON assets.
    urls = re.findall(r'https?://(?:images|static\d*)\.squarespace(?:-cdn)?\.com/[^\s<>"\x27\\]+', html.unescape(markup).replace('\\/', '/'))
    return page, parser, urls

with futures.ThreadPoolExecutor(max_workers=6) as pool:
    jobs = {pool.submit(crawl, page): page for page in pages}
    for job in futures.as_completed(jobs):
        page = jobs[job]
        try:
            page, parser, urls = job.result()
            for url in parser.images + urls: add(url, page)
            for config in parser.video_configs:
                template = str(config.get('alexandriaUrl', ''))
                if template: configs.setdefault(template, {'config': config, 'pages': []})['pages'].append(page)
            for url in parser.embeds: embeds.append({'pageUrl': page, 'sourceUrl': url})
        except Exception as exc: errors.append({'page': page, 'error': str(exc)})

print(f'Crawled {len(pages)} pages; checking {len(sources)} source images', flush=True)

def download(pair):
    url, refs = pair
    candidates = []
    failures = []
    try:
        payload, content_type = fetch(url)
        candidates.append((payload, content_type, 'live original URL'))
    except Exception as exc: failures.append(str(exc))
    for oldpath in refs['oldPaths']:
        local = ROOT / 'public' / oldpath.lstrip('/')
        if local.exists(): candidates.append((local.read_bytes(), '', 'existing local original'))
    choices = []
    for payload, content_type, origin in candidates:
        try:
            with Image.open(io.BytesIO(payload)) as im:
                width, height = im.size
                fmt = im.format
                # Exact decoded-pixel identity catches re-encoded duplicates.
                pixels = ImageOps.exif_transpose(im).convert('RGBA')
                pixelhash = hashlib.sha256(str(pixels.size).encode() + pixels.tobytes()).hexdigest()
            choices.append((width*height, len(payload), payload, width, height, fmt, pixelhash, origin))
        except Exception: pass
    if not choices: return {'sourceUrl': url, 'error': '; '.join(failures) or 'not a supported raster image'}
    _, _, payload, width, height, fmt, pixelhash, origin = max(choices, key=lambda x: (x[0], x[1]))
    return {'sourceUrl': url, 'pages': sorted(refs['pages']), 'labels': sorted(refs['labels']), 'oldPaths': sorted(refs['oldPaths']), 'width': width, 'height': height, 'sha256': hashlib.sha256(payload).hexdigest(), 'pixelHash': pixelhash, 'bytes': len(payload), 'format': fmt, 'origin': origin, '_payload': payload}

assets = []
identities = {}
aliases = {}
with futures.ThreadPoolExecutor(max_workers=6) as pool:
    for record in pool.map(download, sorted(sources.items())):
        if 'error' in record:
            errors.append(record)
            continue
        payload = record.pop('_payload')
        identity = record['pixelHash']
        if identity in identities:
            canonical = identities[identity]
            canonical['sourceUrls'].append(record['sourceUrl'])
            canonical['pages'] = sorted(set(canonical['pages'] + record['pages']))
            canonical['labels'] = sorted(set(canonical['labels'] + record['labels']))
            canonical['oldPaths'] = sorted(set(canonical['oldPaths'] + record['oldPaths']))
        else:
            ext = {'JPEG': '.jpg', 'PNG': '.png', 'WEBP': '.webp', 'GIF': '.gif', 'TIFF': '.tif'}.get(record['format'], extension_for(record['sourceUrl'], 'image/jpeg'))
            name = slugify(next(iter(record['labels']), '') or Path(urllib.parse.unquote_plus(urllib.parse.urlparse(record['sourceUrl']).path)).stem)[:85]
            key = f"media/images/{name}-{record['sha256'][:12]}{ext}"
            canonical = {**record, 'key': key, 'sourceUrls': [record['sourceUrl']]}
            destination = UPLOAD / key
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_bytes(payload)
            identities[identity] = canonical
            assets.append(canonical)
        for oldpath in record['oldPaths']: aliases[oldpath] = '/' + canonical['key']

# Read each master playlist and explicitly select the highest resolution rendition.
for template, data in configs.items():
    url = template.replace('{variant}', 'playlist.m3u8')
    try:
        playlist, _ = fetch(url)
        lines = playlist.decode().splitlines()
        variants = []
        for i, line in enumerate(lines):
            if line.startswith('#EXT-X-STREAM-INF:'):
                resolution = re.search(r'RESOLUTION=(\d+)x(\d+)', line)
                bandwidth = re.search(r'(?:^|,)BANDWIDTH=(\d+)', line.split(':', 1)[1])
                nexturl = next((s.strip() for s in lines[i+1:] if s.strip() and not s.startswith('#')), '')
                variants.append((int(resolution[1])*int(resolution[2]) if resolution else 0, int(bandwidth[1]) if bandwidth else 0, urllib.parse.urljoin(url, nexturl)))
        selected = max(variants)[2] if variants else url
        media_id = slugify(str(data['config'].get('systemDataId') or url.split('/')[-2]))
        key = f'media/videos/{media_id}.mp4'
        destination = UPLOAD / key
        destination.parent.mkdir(parents=True, exist_ok=True)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-allowed_extensions', 'ALL', '-allowed_segment_extensions', 'ALL', '-extension_picky', '0', '-i', selected, '-map', '0:v:0', '-map', '0:a?', '-c', 'copy', '-movflags', '+faststart', str(destination)], check=True, timeout=300)
        probe = json.loads(subprocess.check_output(['ffprobe', '-v', 'quiet', '-show_streams', '-show_format', '-of', 'json', str(destination)]))
        video = next(s for s in probe['streams'] if s['codec_type'] == 'video')
        digest = hashlib.sha256(destination.read_bytes()).hexdigest()
        existing = next((a for a in assets if a['sha256'] == digest), None)
        if existing:
            destination.unlink()
            key = existing['key']
        else:
            assets.append({'key': key, 'sourceUrls': [url], 'selectedRendition': selected, 'pages': sorted(set(data['pages'])), 'width': video['width'], 'height': video['height'], 'duration': probe['format'].get('duration'), 'bytes': destination.stat().st_size, 'sha256': digest, 'format': 'MP4'})
        for item in old['videos']:
            if item['sourceUrl'] == url: aliases[item['path']] = '/' + key
        print(f"Video: {video['width']}x{video['height']} {key}", flush=True)
    except Exception as exc: errors.append({'sourceUrl': url, 'error': str(exc)})

external = [dict(pair) for pair in sorted({tuple(sorted(x.items())) for x in embeds})]
# These two pairs were reviewed visually: a smaller copy and a cropped screenshot.
excluded = []
for duplicate_prefix, original_prefix in [('artistgrant-1-', '11-copy-blured-1-2-'), ('screenshot-2025-04-23-', 'mg-9750-')]:
    duplicate = next(a for a in assets if Path(a['key']).name.startswith(duplicate_prefix))
    original = next(a for a in assets if Path(a['key']).name.startswith(original_prefix))
    for field in ['sourceUrls', 'pages', 'oldPaths', 'labels']:
        original[field] = sorted(set(original.get(field, []) + duplicate.get(field, [])))
    for oldpath in duplicate.get('oldPaths', []): aliases[oldpath] = '/' + original['key']
    duplicate['reason'] = 'Visually reviewed duplicate/crop; retained larger original: ' + original['key']
    excluded.append(duplicate)
    assets.remove(duplicate)
for a in assets[:]:
    if Path(a['key']).name.startswith(('favicon-', 'screenshot-2024-12-06-')):
        a['reason'] = 'Tiny legacy favicon' if 'favicon-' in a['key'] else 'Blank grey placeholder, unused by rebuilt site'
        excluded.append(a)
        assets.remove(a)
        for oldpath in a.get('oldPaths', []): aliases.pop(oldpath, None)
for a in excluded:
    source = UPLOAD / a['key']
    destination = OUT / 'excluded-not-for-upload' / Path(a['key']).name
    destination.parent.mkdir(exist_ok=True)
    if source.exists(): shutil.move(str(source), str(destination))
report = {'pagesCrawled': pages, 'assets': assets, 'excluded': excluded, 'externalEmbeds': external, 'issues': errors, 'oldPathToNewPath': aliases, 'totalBytes': sum(a['bytes'] for a in assets)}
(OUT / 'manifest.json').write_text(json.dumps(report, indent=2, ensure_ascii=False), 'utf-8')
(OUT / 'path-map.json').write_text(json.dumps(aliases, indent=2), 'utf-8')
print(json.dumps({'assets': len(assets), 'images': sum(a['format'] != 'MP4' for a in assets), 'videos': sum(a['format'] == 'MP4' for a in assets), 'bytes': report['totalBytes'], 'issues': errors}, ensure_ascii=True), flush=True)
