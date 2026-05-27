import xml.etree.ElementTree as ET
import zipfile
from io import BytesIO
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi import HTTPException

from app.analysis.utils import (
    get_content_from_project_url,
    get_content_from_xml,
    get_root_from_xml_content,
    get_roots_from_projects_urls,
    get_roots_from_zip,
)


def _make_upload_file(filename, content):
    upload = MagicMock()
    upload.filename = filename
    upload.read = AsyncMock(return_value=content)
    return upload


def _make_zip_upload(files):
    buf = BytesIO()
    with zipfile.ZipFile(buf, "w") as zf:
        for name, content in files.items():
            zf.writestr(name, content)
    buf.seek(0)
    zip_bytes = buf.read()
    upload = MagicMock()
    upload.read = AsyncMock(return_value=zip_bytes)
    return upload


class TestAnalysisUtils:
    async def test_valid_xml_returns_element(self):
        root = await get_root_from_xml_content(b"<project><scenes/></project>")
        assert isinstance(root, ET.Element)
        assert root.tag == "project"

    async def test_malformed_xml_raises_400(self):
        with pytest.raises(HTTPException) as exc_info:
            await get_root_from_xml_content(b"<project><unclosed>")
        assert exc_info.value.status_code == 400
        assert "corrupted" in exc_info.value.detail.lower() or "malformed" in exc_info.value.detail.lower()

    async def test_empty_bytes_raises_400(self):
        with pytest.raises(HTTPException) as exc_info:
            await get_root_from_xml_content(b"")
        assert exc_info.value.status_code == 400

    async def test_xml_with_nested_elements(self):
        root = await get_root_from_xml_content(b"<root><child attr='val'>text</child></root>")
        assert root.tag == "root"
        child = root.find("child")
        assert child is not None
        assert child.get("attr") == "val"

    async def test_xml_file_returns_filename_and_content(self):
        content = b"<project/>"
        upload = _make_upload_file("project.xml", content)
        filename, data = await get_content_from_xml(upload)
        assert filename == "project.xml"
        assert data == content

    async def test_non_xml_file_raises_400(self):
        upload = _make_upload_file("project.txt", b"not xml")
        with pytest.raises(HTTPException) as exc_info:
            await get_content_from_xml(upload)
        assert exc_info.value.status_code == 400

    async def test_no_filename_raises_400(self):
        upload = _make_upload_file(None, b"<project/>")
        with pytest.raises(HTTPException) as exc_info:
            await get_content_from_xml(upload)
        assert exc_info.value.status_code == 400

    async def test_xml_uppercase_extension_accepted(self):
        upload = _make_upload_file("project.XML", b"<project/>")
        filename, data = await get_content_from_xml(upload)
        assert filename == "project.XML"

    async def test_zip_with_single_xml(self):
        upload = _make_zip_upload({"session/project1.xml": b"<project><scenes/></project>"})
        roots = await get_roots_from_zip(upload)
        assert len(roots) == 1
        filename, root = roots[0]
        assert filename == "project1.xml"
        assert isinstance(root, ET.Element)

    async def test_zip_with_multiple_xmls(self):
        files = {
            "session/proj_a.xml": b"<project name='a'/>",
            "session/proj_b.xml": b"<project name='b'/>",
            "session/proj_c.xml": b"<project name='c'/>",
        }
        upload = _make_zip_upload(files)
        roots = await get_roots_from_zip(upload)
        assert len(roots) == 3
        assert {fname for fname, _ in roots} == {"proj_a.xml", "proj_b.xml", "proj_c.xml"}

    async def test_zip_with_malformed_xml_raises_400(self):
        upload = _make_zip_upload({"session/bad.xml": b"<not closed>"})
        with pytest.raises(HTTPException) as exc_info:
            await get_roots_from_zip(upload)
        assert exc_info.value.status_code == 400

    async def test_sample_xml_parsing(self, sample_xml_bytes):
        root = await get_root_from_xml_content(sample_xml_bytes)
        assert isinstance(root, ET.Element)
        assert root.tag in ("project", "snapdata")

    async def test_get_content_from_single_project_url(self, sample_urls):
        first_url = sample_urls.strip().splitlines()[0]
        filename, content = await get_content_from_project_url(first_url)
        assert len(filename) > 0
        assert len(content) > 0
        root = await get_root_from_xml_content(content)
        assert root.tag in ("project", "snapdata")

    async def test_get_roots_from_projects_urls_multiple(self, sample_urls):
        roots = await get_roots_from_projects_urls(sample_urls)
        assert len(roots) == 7
        for filename, root in roots:
            assert isinstance(root, ET.Element)
            assert root.tag in ("project", "snapdata")
