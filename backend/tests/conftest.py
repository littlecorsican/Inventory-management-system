import os
import sys
import tempfile

import pytest

# Point the app at a throwaway data dir *before* it is imported
os.environ["DATA_DIR"] = tempfile.mkdtemp(prefix="inventory-test-")
os.environ["STATIC_DIR"] = os.path.join(os.environ["DATA_DIR"], "no-static")
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient  # noqa: E402
from database import Base, engine  # noqa: E402
from main import app  # noqa: E402


@pytest.fixture()
def client():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as c:
        yield c
