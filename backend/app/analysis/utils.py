import asyncio
import xml.etree.ElementTree as ET
import zipfile
from io import BytesIO

import httpx
from bs4 import BeautifulSoup
from fastapi import HTTPException, UploadFile


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
    async with httpx.AsyncClient() as client:
        project_page = await client.get(project_url, headers={"user-agent": "Mozilla/5.0"})
        
        download_url = await asyncio.to_thread(_extract_link_from_html, project_page.content)
        
        if not download_url:
            raise HTTPException(status_code=400, detail="Failed to find the project")
            
        filename = download_url.split("/")[-1]

        response = await client.get("https://snap.berkeley.edu" + download_url)

    return filename, response.content

def _extract_link_from_html(content: bytes) -> str:
    s = BeautifulSoup(content, "html.parser")
    download_link = s.find(
        "a", class_="btn btn-outline-primary download", attrs={"download": True}
    )
        
    if download_link and download_link.get("href"):
        return download_link.get("href")
    return None


def _extract_and_parse_zip(content: bytes):
    roots_list = []
    with zipfile.ZipFile(BytesIO(content)) as zip_file:
        for project in zip_file.namelist():
            xml = zip_file.read(project)
            root = get_root_from_xml_content(xml)
            roots_list.append((project.split("/")[1], root))
    return roots_list

async def get_roots_from_zip(zip_file: UploadFile):
    content = await zip_file.read()
    return await asyncio.to_thread(_extract_and_parse_zip, content)


async def get_roots_from_projects_urls(projects_urls: str):
    roots_list = []
    # urls = projects_urls.split(",")
    urls = ["https://" + url.strip() for url in projects_urls.split("https://") if url.strip()]
    for project_url in urls:
        filename, project_xml = await get_content_from_project_url(project_url.strip())
        root =await asyncio.to_thread(get_root_from_xml_content, project_xml)
        roots_list.append((filename, root))
    return roots_list
