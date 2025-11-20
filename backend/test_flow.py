import requests
import sys
import time

BASE_URL = "http://localhost:8001"

def test_flow():
    # 1. Auth
    email = f"test_{int(time.time())}@example.com"
    password = "password123"
    name = "Test User"

    print(f"1. Registering user {email}...")
    response = requests.post(f"{BASE_URL}/auth/register", json={
        "email": email,
        "password": password,
        "name": name
    }, timeout=10)
    if response.status_code != 200:
        print("Register Failed:", response.text)
        sys.exit(1)

    print("2. Logging in...")
    response = requests.post(f"{BASE_URL}/auth/login", json={
        "email": email,
        "password": password
    })
    if response.status_code != 200:
        print("Login Failed:", response.text)
        sys.exit(1)
    
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Suggest Recipes
    print("\n3. Suggesting recipes (this may take a while)...")
    response = requests.post(f"{BASE_URL}/recipes/suggest", json={
        "ingredients": ["Chicken", "Rice", "Tomatoes"],
        "preferences": {
            "cuisine": "Italian",
            "spice_level": "Mild",
            "max_time": 30
        }
    }, headers=headers)

    if response.status_code != 200:
        print("Suggest Failed:", response.text)
        sys.exit(1)
    
    recipes = response.json()["recipes"]
    print(f"Received {len(recipes)} recipes.")
    if not recipes:
        print("No recipes returned.")
        sys.exit(1)
    
    first_recipe = recipes[0]
    print(f"First Recipe: {first_recipe['name']}")
    print(f"Image URL (truncated): {first_recipe.get('image_url', '')[:50]}...")

    # 3. Save Recipe
    print("\n4. Saving first recipe...")
    response = requests.post(f"{BASE_URL}/recipes/save", json=first_recipe, headers=headers)
    
    if response.status_code != 200:
        print("Save Failed:", response.text)
        sys.exit(1)
    
    print("Recipe saved successfully.")

    # 4. Get Saved Recipes
    print("\n5. Retrieving saved recipes...")
    response = requests.get(f"{BASE_URL}/recipes/saved", headers=headers)
    
    if response.status_code != 200:
        print("Get Saved Failed:", response.text)
        sys.exit(1)
    
    saved_recipes = response.json()
    print(f"Found {len(saved_recipes)} saved recipes.")
    
    found = False
    for r in saved_recipes:
        if r["name"] == first_recipe["name"]:
            found = True
            print("Verified saved recipe matches.")
            break
    
    if not found:
        print("Saved recipe not found in list!")
        sys.exit(1)

    print("\nTest Flow Completed Successfully!")

if __name__ == "__main__":
    test_flow()
