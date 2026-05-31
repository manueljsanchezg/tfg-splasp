import asyncio
import xml.etree.ElementTree as ET
import zipfile
from io import BytesIO
from typing import Optional
from urllib.parse import urlparse

import httpx
from fastapi import HTTPException, UploadFile
from selectolax.parser import HTMLParser

_http_client: httpx.AsyncClient = None


def _get_http_client() -> httpx.AsyncClient:
    global _http_client
    if _http_client is None:
        _http_client = httpx.AsyncClient(headers={"user-agent": "Mozilla/5.0"})
    return _http_client


def get_root_from_xml_content(content_xml: bytes):
    try:
        root = ET.fromstring(content_xml)
    except ET.ParseError:
        raise HTTPException(status_code=400, detail="The content is corrupted or malformed")
    return root


async def get_content_from_xml(file: UploadFile):
    if not file.filename or not file.filename.lower().endswith(".xml"):
        raise HTTPException(status_code=400, detail="The file is not xml")
    return file.filename, await file.read()


async def get_content_from_project_url(project_url: str):
    parsed = urlparse(project_url)
    if parsed.netloc not in ("snap.berkeley.edu", "www.snap.berkeley.edu"):
        raise HTTPException(status_code=400, detail="Invalid project source URL")

    client = _get_http_client()
    project_page = await client.get(project_url)

    download_url = _extract_link_from_html(project_page.content)

    if not download_url:
        raise HTTPException(status_code=400, detail="Failed to find the project")

    filename = download_url.split("/")[-1]

    response = await client.get("https://snap.berkeley.edu" + download_url)

    return filename, response.content


def _extract_link_from_html(content: bytes) -> Optional[str]:
    tree = HTMLParser(content)
    node = tree.css_first("a.btn.btn-outline-primary.download[download]")

    if node:
        return node.attributes.get("href")
    return None


def _extract_and_parse_zip(content: bytes):
    roots_list = []
    with zipfile.ZipFile(BytesIO(content)) as zip_file:
        for file_path in zip_file.namelist():
            if (
                file_path.endswith("/")
                or not file_path.lower().endswith(".xml")
                or "__MACOSX" in file_path
            ):
                continue
            xml = zip_file.read(file_path)
            root = get_root_from_xml_content(xml)
            filename = file_path.split("/")[-1]
            roots_list.append((filename, root))
    return roots_list


async def get_roots_from_zip(zip_file: UploadFile):
    content = await zip_file.read()
    return await asyncio.to_thread(_extract_and_parse_zip, content)


async def _process_single_url(project_url: str):
    filename, project_xml = await get_content_from_project_url(project_url.strip())
    root = await asyncio.to_thread(get_root_from_xml_content, project_xml)
    return filename, root


async def get_roots_from_projects_urls(projects_urls: str):
    urls = ["https://" + url.strip() for url in projects_urls.split("https://") if url.strip()]
    tasks = [_process_single_url(url) for url in urls]
    roots_list = await asyncio.gather(*tasks)
    return list(roots_list)
