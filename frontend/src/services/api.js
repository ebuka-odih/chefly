// API Service for ChopWhat Backend
// Update this to your backend URL
export const API_URL = "http://localhost:8001";

export const detectIngredients = async (imageFile) => {
    try {
        const formData = new FormData();
        formData.append('file', imageFile);

        const response = await fetch(`${API_URL}/ingredients/detect`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to detect ingredients');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Detection error:", error);
        // Fallback mock for demo purposes if backend isn't running
        return { ingredients: ["Yam", "Tomatoes", "Onions", "Pepper"] };
    }
};

export const suggestRecipes = async (ingredients, preferences = {}) => {
    try {
        console.log('Calling API:', `${API_URL}/recipes/suggest`);
        console.log('With ingredients:', ingredients);

        const response = await fetch(`${API_URL}/recipes/suggest`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ingredients: ingredients,
                preferences: {
                    cuisine: preferences.cuisine || "Nigerian",
                    spice_level: preferences.spice_level || "Medium",
                    max_time: preferences.max_time || 60
                }
            }),
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`Failed to fetch suggestions: ${response.status}`);
        }

        const data = await response.json();
        console.log('Received recipes:', data);
        return data;
    } catch (error) {
        console.error("Suggestion error:", error);
        // Fallback mock
        return { recipes: [] };
    }
};

export const visualizeSteps = async (steps) => {
    try {
        console.log('Calling API:', `${API_URL}/recipes/visualize`);

        const response = await fetch(`${API_URL}/recipes/visualize`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                steps: steps
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to visualize steps');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Visualization error:", error);
        return [];
    }
};

export const saveRecipe = async (recipe) => {
    try {
        const response = await fetch(`${API_URL}/recipes/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ recipe }),
        });

        if (!response.ok) {
            throw new Error('Failed to save recipe');
        }

        return await response.json();
    } catch (error) {
        console.error("Save error:", error);
        return { status: 'error' };
    }
};

export const getSavedRecipes = async () => {
    try {
        const response = await fetch(`${API_URL}/recipes/saved`);

        if (!response.ok) {
            throw new Error('Failed to fetch saved recipes');
        }

        return await response.json();
    } catch (error) {
        console.error("Fetch saved recipes error:", error);
        return { recipes: [] };
    }
};

export const getHistory = async () => {
    try {
        const response = await fetch(`${API_URL}/history`);

        if (!response.ok) {
            throw new Error('Failed to fetch history');
        }

        return await response.json();
    } catch (error) {
        console.error("Fetch history error:", error);
        return { history: [] };
    }
};
