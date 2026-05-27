import os

import pytest

FIXTURES_DIR = os.path.join(os.path.dirname(__file__), "fixtures")

@pytest.fixture
def sample_xml_bytes():
    xml_path = os.path.join(FIXTURES_DIR, "sample.xml")
    with open(xml_path, "rb") as f:
        return f.read()

@pytest.fixture
def sample_urls():
    txt_path = os.path.join(FIXTURES_DIR, "samples.txt")
    with open(txt_path, "r", encoding="utf-8") as f:
        return f.read()
