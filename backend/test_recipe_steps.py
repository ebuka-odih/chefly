import requests
import sys
import time

BASE_URL = "http://localhost:8001"

def test_recipe_with_step_images():
    print("Testing Recipe Generation with Step Images...")
    start_time = time.time()
    
    response = requests.post(f"{BASE_URL}/recipes/suggest", json={
        "ingredients": ["Rice", "Chicken", "Tomatoes", "Onions"],
        "preferences": {
            "cuisine": "Italian",
            "spice_level": "Medium",
            "max_time": 45
        }
    }, timeout=120)  # Long timeout for image generation

    if response.status_code == 200:
        data = response.json()
        recipes = data.get("recipes", [])
        print(f"\nSuccess! Generated {len(recipes)} recipes in {time.time() - start_time:.2f}s")
        
        for i, recipe in enumerate(recipes):
            print(f"\n=== Recipe {i+1}: {recipe['name']} ===")
            print(f"Main Image: {recipe.get('image_url', 'None')[:50]}..." if recipe.get('image_url') else "Main Image: None")
            print(f"Steps: {len(recipe.get('steps', []))}")
            
            step_images = recipe.get('step_images', [])
            print(f"Step Images: {len([img for img in step_images if img])} generated")
            
            for j, (step, img) in enumerate(zip(recipe.get('steps', []), step_images)):
                status = "✓" if img else "✗"
                print(f"  {status} Step {j+1}: {step[:50]}...")
                if img:
                    print(f"     Image: {img[:50]}...")
    else:
        print("Recipe Generation Failed:", response.text)
        sys.exit(1)

if __name__ == "__main__":
    test_recipe_with_step_images()
