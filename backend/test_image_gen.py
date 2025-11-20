import google.generativeai as genai
from app.config import settings
import base64

genai.configure(api_key=settings.GOOGLE_API_KEY)

def test_image_gen():
    try:
        model = genai.GenerativeModel('gemini-2.0-flash-exp-image-generation')
        response = model.generate_content("A delicious plate of pasta", generation_config={"response_mime_type": "image/jpeg"})
        
        print(f"Response parts: {len(response.parts)}")
        # Check if response has image
        # This is a guess on how it works for this model
        print(response.text)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_image_gen()
