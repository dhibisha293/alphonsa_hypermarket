from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_categories():
    response = client.get("/api/categories")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    # If the database has data, check it's a list
    assert isinstance(data["data"], list)

def test_get_products():
    response = client.get("/api/products")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert isinstance(data["data"], dict)
    assert "products" in data["data"]
