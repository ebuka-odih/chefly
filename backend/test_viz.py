import requests
import sys
import time

BASE_URL = "http://localhost:8001"

def test_visualization():
    steps = [
        "Chop the onions and tomatoes finely.",
        "Heat the oil in a pan and fry the onions until golden brown.",
        "Add the tomatoes and cook until soft."
    ]

    print("Testing Step Visualization...")
    start_time = time.time()
    response = requests.post(f"{BASE_URL}/recipes/visualize", json={
        "steps": steps
    }, timeout=60) # Long timeout for image generation

    if response.status_code == 200:
        images = response.json()
        print(f"Success! Generated {len(images)} images in {time.time() - start_time:.2f}s")
        for i, img in enumerate(images):
            print(f"Step {i+1}: {img[:50]}..." if img else f"Step {i+1}: Failed")
    else:
        print("Visualization Failed:", response.text)
        sys.exit(1)

if __name__ == "__main__":
    test_visualization()
