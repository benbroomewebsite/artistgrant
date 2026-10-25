"""Generate responsive WebP display files; never alter the archived originals."""
import base64
import hashlib
import io
import json
import sys
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
ARCHIVE = ROOT.parent / 'artistgrant-media-prepared'
manifest = json.loads((ARCHIVE / 'manifest.json').read_text('utf-8'))
banner_only = '--reference-banner-only' in sys.argv
catalogue = json.loads((ROOT / 'lib/image-variants.json').read_text('utf-8')) if banner_only else {}
uploads = json.loads((ARCHIVE / 'display-manifest.json').read_text('utf-8')) if banner_only else []
assets = [] if banner_only else list(manifest['assets'])
# The reference intentionally art-directs the 2024 banner with a different crop.
# Keep one archived original, but retain this composition as a display variant.
banner = next((ARCHIVE / 'excluded-not-for-upload').glob('screenshot-2025-04-23-*.jpg'))
assets.append({'key': 'media/hero/2024', 'format': 'JPEG', 'localSource': str(banner)})
uploads = [a for a in uploads if not Path(a['key']).name.startswith('2024-')]
for asset in assets:
    if asset['format'] == 'MP4':
        continue
    with Image.open(asset.get('localSource') or ARCHIVE / 'upload' / asset['key']) as source:
        original = ImageOps.exif_transpose(source).convert('RGB')
    width, height = original.size
    tiny = ImageOps.contain(original, (12, 12))
    buffer = io.BytesIO()
    tiny.save(buffer, 'WEBP', quality=35)
    variants = []
    for size in sorted({min(w, width) for w in [160, 320, 480, 640, 960, 1440, 1920, 2560]}):
        resized = original.resize((size, round(height * size / width)), Image.Resampling.LANCZOS)
        buffer = io.BytesIO()
        resized.save(buffer, 'WEBP', quality=82, method=6)
        payload = buffer.getvalue()
        digest = hashlib.sha256(payload).hexdigest()
        key = f'media/display/{Path(asset["key"]).stem}-{size}-{digest[:8]}.webp'
        destination = ARCHIVE / 'display-upload' / key
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(payload)
        variants.append({'width': size, 'path': '/' + key})
        uploads.append({'key': key, 'bytes': len(payload), 'sha256': digest})
    blur = io.BytesIO()
    tiny.save(blur, 'WEBP', quality=35)
    catalogue['/' + asset['key']] = {
        'width': width, 'height': height,
        'blurDataURL': 'data:image/webp;base64,' + base64.b64encode(blur.getvalue()).decode(),
        'variants': variants,
    }
(ROOT / 'lib/image-variants.json').write_text(json.dumps(catalogue, separators=(',', ':')), 'utf-8')
(ARCHIVE / 'display-manifest.json').write_text(json.dumps(uploads, indent=2), 'utf-8')
print(f'{len(catalogue)} images, {len(uploads)} responsive files, {sum(x["bytes"] for x in uploads):,} bytes')
