#!/usr/bin/env python3
"""Download original Squarespace images into public/media.

The generated manifest keeps source URLs and page ownership so the same paths can
later be uploaded to an object store such as Cloudflare R2 without changing the
site's public `/media/...` URLs.
"""

from __future__ import annotations

import argparse
import hashlib
import html
import json
import mimetypes
import re
import shutil
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path
from html.parser import HTMLParser

DEFAULT_SITEMAP = "https://www.artistgrant.co.uk/sitemap.xml"
USER_AGENT = "ArtistGrantMediaImporter/1.0 (+https://www.artistgrant.co.uk/)"
IMAGE_NAMESPACE = "http://www.google.com/schemas/sitemap-image/1.1"
SITEMAP_NAMESPACE = "http://www.sitemaps.org/schemas/sitemap/0.9"


def slugify(value: str) -> str:
    value = urllib.parse.unquote_plus(value).lower()
    value = re.sub(r"[^a-z0-9]+", "-", value).strip("-")
    return value or "image"


def fetch(url: str) -> tuple[bytes, str]:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=60) as response:
        return response.read(), response.headers.get_content_type()


def extension_for(url: str, content_type: str) -> str:
    path_extension = Path(urllib.parse.urlparse(url).path).suffix.lower()
    if re.fullmatch(r"\.[a-z0-9]{2,5}", path_extension):
        return ".jpg" if path_extension == ".jpeg" else path_extension
    guessed = mimetypes.guess_extension(content_type) or ".bin"
    return ".jpg" if guessed == ".jpe" else guessed


def page_folder(page_url: str) -> str:
    path = urllib.parse.urlparse(page_url).path.strip("/")
    return slugify(path.replace("/", "-")) if path else "home"


def parse_sitemap(xml_bytes: bytes) -> list[dict[str, str]]:
    root = ET.fromstring(xml_bytes)
    records: list[dict[str, str]] = []
    for page in root.findall(f"{{{SITEMAP_NAMESPACE}}}url"):
        page_url = page.findtext(f"{{{SITEMAP_NAMESPACE}}}loc", "")
        for image in page.findall(f"{{{IMAGE_NAMESPACE}}}image"):
            source_url = image.findtext(f"{{{IMAGE_NAMESPACE}}}loc", "").strip()
            if not source_url:
                continue
            records.append(
                {
                    "pageUrl": page_url,
                    "sourceUrl": source_url,
                    "title": image.findtext(f"{{{IMAGE_NAMESPACE}}}title", "").strip(),
                    "caption": image.findtext(f"{{{IMAGE_NAMESPACE}}}caption", "").strip(),
                }
            )
    return records


class PageMediaParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.video_configs: list[dict[str, object]] = []
        self.embeds: list[str] = []
        self.images: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = dict(attrs)
        config = attributes.get("data-config-video")
        if config:
            try:
                self.video_configs.append(json.loads(html.unescape(config)))
            except json.JSONDecodeError:
                pass
        if tag == "iframe" and attributes.get("src"):
            source = attributes["src"]
            if "youtube" in source or "vimeo" in source or "embedly" in source:
                self.embeds.append("https:" + source if source.startswith("//") else source)
        if tag == "img":
            source = attributes.get("data-src") or attributes.get("src")
            if source and "squarespace-cdn.com" in source:
                self.images.append(source.split("?", 1)[0])


def download_page_media(page_urls: list[str], output: Path, images: list[dict[str, object]]) -> tuple[list[dict[str, object]], list[dict[str, str]]]:
    ffmpeg = shutil.which("ffmpeg")
    videos: list[dict[str, object]] = []
    embeds: list[dict[str, str]] = []
    for page_url in page_urls:
        page_bytes, _ = fetch(page_url)
        parser = PageMediaParser()
        parser.feed(page_bytes.decode("utf-8", errors="replace"))
        known_sources = {str(item["sourceUrl"]) for item in images}
        for source_url in dict.fromkeys(parser.images):
            if source_url in known_sources:
                continue
            payload, content_type = fetch(source_url)
            source_name = Path(urllib.parse.urlparse(source_url).path).name
            digest = hashlib.sha256(payload).hexdigest()
            filename = f"{slugify(Path(source_name).stem)}-{digest[:8]}{extension_for(source_url, content_type)}"
            relative_path = Path(page_folder(page_url)) / filename
            destination = output / relative_path
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_bytes(payload)
            images.append({
                "pageUrl": page_url, "sourceUrl": source_url, "title": "", "caption": "",
                "path": "/media/" + relative_path.as_posix(), "bytes": len(payload),
                "contentType": content_type, "sha256": digest,
            })
            known_sources.add(source_url)
            print(f"[page image] {destination}")
        for embed_url in dict.fromkeys(parser.embeds):
            embeds.append({"pageUrl": page_url, "sourceUrl": embed_url})
        for index, config in enumerate(parser.video_configs, start=1):
            template = str(config.get("alexandriaUrl", ""))
            if not template or not ffmpeg:
                continue
            playlist_url = template.replace("{variant}", "playlist.m3u8")
            media_id = str(config.get("systemDataId") or config.get("id") or index)
            relative_path = Path(page_folder(page_url)) / f"video-{index}-{slugify(media_id)}.mp4"
            destination = output / relative_path
            destination.parent.mkdir(parents=True, exist_ok=True)
            if not destination.exists():
                subprocess.run(
                    [ffmpeg, "-loglevel", "error", "-y", "-allowed_extensions", "ALL", "-allowed_segment_extensions", "ALL", "-extension_picky", "0", "-i", playlist_url, "-c", "copy", str(destination)],
                    check=True,
                )
            videos.append(
                {
                    "pageUrl": page_url,
                    "sourceUrl": playlist_url,
                    "path": "/media/" + relative_path.as_posix(),
                    "bytes": destination.stat().st_size,
                    "contentType": "video/mp4",
                    "durationSeconds": config.get("durationSeconds"),
                    "aspectRatio": config.get("aspectRatio"),
                    "sha256": hashlib.sha256(destination.read_bytes()).hexdigest(),
                }
            )
            print(f"[video] {destination}")
    return videos, embeds


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--sitemap", default=DEFAULT_SITEMAP)
    parser.add_argument("--output", type=Path, default=Path("public/media"))
    parser.add_argument("--manifest", type=Path, default=Path("public/media/manifest.json"))
    args = parser.parse_args()

    sitemap, _ = fetch(args.sitemap)
    records = parse_sitemap(sitemap)
    args.output.mkdir(parents=True, exist_ok=True)
    manifest: list[dict[str, object]] = []

    for index, record in enumerate(records, start=1):
        source_url = record["sourceUrl"]
        try:
            payload, content_type = fetch(source_url)
        except (urllib.error.URLError, TimeoutError) as error:
            print(f"warning: could not download {source_url}: {error}", file=sys.stderr)
            continue

        source_name = Path(urllib.parse.urlparse(source_url).path).name
        stem = slugify(record["caption"] or Path(source_name).stem)
        digest = hashlib.sha256(payload).hexdigest()
        filename = f"{stem}-{digest[:8]}{extension_for(source_url, content_type)}"
        relative_path = Path(page_folder(record["pageUrl"])) / filename
        destination = args.output / relative_path
        destination.parent.mkdir(parents=True, exist_ok=True)
        if not destination.exists() or destination.read_bytes() != payload:
            destination.write_bytes(payload)

        manifest.append(
            {
                **record,
                "path": "/media/" + relative_path.as_posix(),
                "bytes": len(payload),
                "contentType": content_type,
                "sha256": digest,
            }
        )
        print(f"[{index:02}/{len(records):02}] {destination}")

    page_urls = list(dict.fromkeys(record["pageUrl"] for record in records))
    videos, embeds = download_page_media(page_urls, args.output, manifest)
    args.manifest.parent.mkdir(parents=True, exist_ok=True)
    args.manifest.write_text(
        json.dumps(
            {
                "source": args.sitemap,
                "count": len(manifest) + len(videos),
                "images": manifest,
                "videos": videos,
                "externalEmbeds": embeds,
            },
            indent=2,
            ensure_ascii=False,
        )
        + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(manifest)} image references, {len(videos)} videos, and {args.manifest}")
    return 0 if len(manifest) == len(records) else 1


if __name__ == "__main__":
    raise SystemExit(main())
