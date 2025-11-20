import time
from openai import OpenAI
from app.config import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)

def test_dalle_anime():
    """Test DALL-E 3 with anime style"""
    print("Testing DALL-E 3 with anime style...")
    start = time.time()
    
    try:
        prompt = """Anime-style illustration of chopping onions on a cutting board.
        
        Style: Colorful anime/manga art style, vibrant colors, clean lines, cute and fun.
        Composition: Top-down view of a cutting board with onions and a knife.
        NO HUMANS, NO HANDS - just the ingredients and utensils in anime style.
        Background: Simple, bright, game-like interface."""
        
        response = client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size="1024x1024",
            quality="standard",
            n=1,
        )
        
        elapsed = time.time() - start
        image_url = response.data[0].url
        
        print(f"✅ DALL-E 3 Success!")
        print(f"⏱️  Time: {elapsed:.2f}s")
        print(f"🖼️  URL: {image_url[:80]}...")
        return elapsed, image_url
        
    except Exception as e:
        print(f"❌ DALL-E 3 Failed: {e}")
        return None, None

if __name__ == "__main__":
    test_dalle_anime()
