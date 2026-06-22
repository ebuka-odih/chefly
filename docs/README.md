# Chefly 👨🏾‍🍳

Chefly is an intelligent, AI-powered cooking assistant designed to help you cook with confidence. By leveraging advanced AI models, Chefly transforms the ingredients you have at home into delicious, personalized recipes, complete with visual guides.

## 🚀 Features

- **📸 Snap & Cook**: Simply take a photo of your ingredients, and Chefly will identify them instantly.
- **✨ AI Recipe Generation**: Get detailed, step-by-step recipes tailored to your available ingredients, preferences, and cooking time.
- **🎨 Visual Cooking Steps**: Experience cooking like never before with AI-generated, 3D anime-style visualizations for every step of the recipe.
- **🎲 Surprise Me**: Not sure what to eat? Let Chefly generate a random meal idea based on your mood and category preferences (Breakfast, Lunch, Dinner, etc.).
- **📝 Smart Ingredient Input**: Manually type or edit your ingredient list for precise control.

## 📸 Screenshots

<div align="center">
  <img src="screenshots/home.png" alt="Home Screen" width="200"/>
  <img src="screenshots/suggestions.png" alt="Recipe Suggestions" width="200"/>
  <img src="screenshots/recipe-detail.png" alt="Recipe Detail" width="200"/>
  <img src="screenshots/cooking-mode.png" alt="Cooking Mode" width="200"/>
</div>

## 🧠 AI Models & Technology

All AI runs through **[OpenRouter](https://openrouter.ai)** (one OpenAI-compatible
API, swappable models). See [`IMPLEMENTATION.md`](IMPLEMENTATION.md) for details.

- **Vision** (`openai/gpt-4o-mini`): analyzes photos to detect and list ingredients,
  time-aware and tuned for African/Nigerian staples.
- **Recipe intelligence** (`openai/gpt-4.1-mini`): generates structured,
  **time-of-day-aware** recipes — quick energising food in the morning, a proper
  meal at dinner — with steps, timing and substitutions.
- **Image generation** (`google/gemini-2.5-flash-image`): photorealistic dish and
  cooking-step images, cached aggressively to keep cost down.

## 🛠️ Tech Stack

- **Frontend**: React Native (Expo) for a cross-platform mobile experience (iOS, Android, and Web).
- **Backend**: Python (FastAPI) for a robust and high-performance API.
- **AI gateway**: OpenRouter (vision · recipes · images).
- **Database**: PostgreSQL for reliable data storage.
- **Deploy**: Docker + Dokploy (auto-deploy from `main`).
