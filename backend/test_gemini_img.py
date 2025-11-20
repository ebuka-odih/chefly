import google.generativeai as genai
from app.config import settings
import base64

genai.configure(api_key=settings.GOOGLE_API_KEY)

def test_gemini_image():
    try:
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
        prompt = "Generate a professional food photography image of Jollof Rice with chicken. Style: appetizing, well-lit, vibrant colors."
        
        print("Generating image with Gemini Nano Banana...")
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                response_modalities=["image"]
            )
        )
        
        print("Response received!")
        print(f"Candidates: {len(response.candidates) if response.candidates else 0}")
        
        if response.candidates and len(response.candidates) > 0:
            candidate = response.candidates[0]
            print(f"Has content: {hasattr(candidate, 'content')}")
            if hasattr(candidate, 'content') and candidate.content.parts:
                print(f"Parts: {len(candidate.content.parts)}")
                for i, part in enumerate(candidate.content.parts):
                    print(f"Part {i}: has inline_data = {hasattr(part, 'inline_data')}")
                    if hasattr(part, 'inline_data'):
                        image_data = part.inline_data.data
                        mime_type = part.inline_data.mime_type
                        print(f"Success! Generated {mime_type} image, size: {len(image_data)} bytes")
                        return True
        
        print("No image data found in response")
        return False
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_gemini_image()
