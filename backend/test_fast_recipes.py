import requests
import time

BASE_URL = "http://localhost:8001"

def test_fast_recipe_generation():
    print("Testing Fast Recipe Generation (no step images)...")
    start_time = time.time()
    
    response = requests.post(f"{BASE_URL}/recipes/suggest", json={
        "ingredients": ["Egg", "Rice", "Plantain", "Tomatoes"],
        "preferences": {
            "cuisine": "African",
            "spice_level": "Medium",
            "max_time": 45
        }
    }, timeout=60)

    elapsed = time.time() - start_time
    
    if response.status_code == 200:
        data = response.json()
        recipes = data.get("recipes", [])
        print(f"\n✅ Success! Generated {len(recipes)} recipes in {elapsed:.2f}s")
        
        for i, recipe in enumerate(recipes):
            print(f"\n📋 Recipe {i+1}: {recipe['name']}")
            print(f"   Main Image: {'✓' if recipe.get('image_url') else '✗'}")
            print(f"   Steps: {len(recipe.get('steps', []))}")
            print(f"   Step Images: {len(recipe.get('step_images', []))} (should be 0 for fast mode)")
    else:
        print(f"❌ Failed: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    test_fast_recipe_generation()
