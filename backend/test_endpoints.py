import time

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.database import Base, get_db
from app.main import app


engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


def auth_headers():
    email = f"crud-{int(time.time() * 1000)}@example.com"
    password = "password123"
    response = client.post("/auth/register", json={"email": email, "password": password, "name": "CRUD Tester"})
    assert response.status_code == 200, response.text

    response = client.post("/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200, response.text
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}, email


def sample_recipe(**overrides):
    payload = {
        "client_id": "client-jollof",
        "name": "Jollof Rice",
        "description": "Smoky tomato rice.",
        "estimated_time_minutes": 35,
        "difficulty": "Easy",
        "meal_type": "Dinner",
        "image_url": None,
        "uses_from_user": ["Rice", "Tomatoes"],
        "extra_ingredients": ["Oil", "Stock cube"],
        "steps": ["Blend sauce.", "Cook rice."],
        "step_images": [],
    }
    payload.update(overrides)
    return payload


def test_all_endpoints_and_saved_recipe_crud(monkeypatch):
    from app.routes import images, ingredients, recipes, auth

    monkeypatch.setattr(ingredients, "detect_ingredients_from_image", lambda _: ["Rice", "Tomatoes"])
    monkeypatch.setattr(images, "generate_dish_image", lambda *_: "https://example.com/recipe.png")
    monkeypatch.setattr(recipes, "generate_recipes_from_ingredients", lambda *_, **__: [sample_recipe()])
    monkeypatch.setattr(recipes, "generate_step_image", lambda step: f"https://example.com/{step[:5]}.png")
    monkeypatch.setattr(auth, "send_otp_email", lambda *_: None)
    monkeypatch.setattr(auth, "create_otp_code", lambda _: "123456")

    response = client.get("/")
    assert response.status_code == 200

    headers, email = auth_headers()
    response = client.get("/auth/me", headers=headers)
    assert response.status_code == 200
    assert response.json()["email"] == email

    patch_response = client.patch("/auth/me", json={"name": "Ada Cook"}, headers=headers)
    assert patch_response.status_code == 200, patch_response.text
    assert patch_response.json()["name"] == "Ada Cook"

    derived_email = f"jane.doe-{int(time.time() * 1000)}@example.com"
    response = client.post("/auth/register", json={"email": derived_email, "password": "password123"})
    assert response.status_code == 200, response.text
    assert response.json()["name"].startswith("Jane Doe")

    otp_email = f"otp-{int(time.time() * 1000)}@example.com"
    response = client.post("/auth/otp/request", json={"email": otp_email})
    assert response.status_code == 200, response.text
    response = client.post("/auth/otp/verify", json={"email": otp_email, "code": "123456"})
    assert response.status_code == 200, response.text
    assert response.json()["user"]["email"] == otp_email
    assert response.json()["user"]["name"].startswith("Otp")

    response = client.post("/ingredients/detect", files={"file": ("food.jpg", b"image-bytes", "image/jpeg")})
    assert response.status_code == 200, response.text
    assert response.json()["ingredients"] == ["Rice", "Tomatoes"]

    response = client.post("/recipes/suggest", json={"ingredients": ["Rice", "Tomatoes"]})
    assert response.status_code == 200, response.text
    assert response.json()["recipes"][0]["name"] == "Jollof Rice"

    response = client.post("/recipes/save", json=sample_recipe(), headers=headers)
    assert response.status_code == 200, response.text
    assert response.json()["id"] == "client-jollof"

    response = client.get("/recipes/saved", headers=headers)
    assert response.status_code == 200, response.text
    assert len(response.json()) == 1

    response = client.get("/recipes/saved/client-jollof", headers=headers)
    assert response.status_code == 200, response.text
    assert response.json()["name"] == "Jollof Rice"

    response = client.put(
        "/recipes/saved/client-jollof",
        json={"difficulty": "Medium", "steps": ["Blend sauce.", "Cook rice.", "Rest."]},
        headers=headers,
    )
    assert response.status_code == 200, response.text
    assert response.json()["difficulty"] == "Medium"
    assert len(response.json()["steps"]) == 3

    response = client.post("/recipes/visualize", json={"steps": ["Blend sauce"]})
    assert response.status_code == 200, response.text
    assert response.json()[0].startswith("https://example.com/")

    response = client.post(
        "/images/generate",
        json={"recipe_name": "Jollof Rice", "recipe_description": "Smoky tomato rice."},
    )
    assert response.status_code == 200, response.text
    assert response.json()["success"] is True

    response = client.delete("/recipes/saved/client-jollof", headers=headers)
    assert response.status_code == 204, response.text
    response = client.get("/recipes/saved/client-jollof", headers=headers)
    assert response.status_code == 404
