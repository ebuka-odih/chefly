import requests
import json

BASE_URL = "http://localhost:8001"

def test_emoji_generation():
    print("Testing Recipe Generation with Emoji Icons...")
    
    response = requests.post(f"{BASE_URL}/recipes/suggest", json={
        "ingredients": ["Rice", "Chicken", "Tomatoes", "Onions"],
        "preferences": {
            "cuisine": "African",
            "spice_level": "Medium",
            "max_time": 45
        }
    }, timeout=60)

    if response.status_code == 200:
        data = response.json()
        recipes = data.get("recipes", [])
        print(f"\n✅ Generated {len(recipes)} recipes\n")
        
        for i, recipe in enumerate(recipes):
            print(f"{'='*60}")
            print(f"📋 Recipe {i+1}: {recipe['name']}")
            print(f"{'='*60}")
            
            steps = recipe.get('steps', [])
            emojis = recipe.get('step_images', [])
            
            print(f"\n🔢 Total Steps: {len(steps)}")
            print(f"😀 Total Emojis: {len(emojis)}\n")
            
            for j, (step, emoji) in enumerate(zip(steps, emojis)):
                print(f"{emoji} Step {j+1}: {step}")
            print()
    else:
        print(f"❌ Failed: {response.status_code}")

if __name__ == "__main__":
    test_emoji_generation()
