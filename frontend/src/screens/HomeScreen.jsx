import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Edit3, Sparkles, X } from 'lucide-react';
import './HomeScreen.css';

const QUICK_INGREDIENTS = [
    "Yam", "Rice", "Plantain", "Eggs", "Tomatoes", "Onions", "Chicken", "Pepper"
];

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];
const FOOD_CATEGORIES = ["Rice", "Soup", "Pasta", "Salad", "Grilled", "Fried"];

function HomeScreen() {
    const navigate = useNavigate();
    const [showSurpriseModal, setShowSurpriseModal] = useState(false);
    const [selectedMealType, setSelectedMealType] = useState("Lunch");
    const [selectedCategory, setSelectedCategory] = useState("Rice");

    const handleSurpriseMe = () => {
        setShowSurpriseModal(false);
        const randomIngredients = getRandomIngredientsForCategory(selectedCategory);
        navigate('/suggestions', {
            state: {
                ingredients: randomIngredients,
                preferences: {
                    cuisine: "African",
                    spice_level: "Medium",
                    max_time: selectedMealType === "Breakfast" ? 30 : 60
                }
            }
        });
    };

    const getRandomIngredientsForCategory = (category) => {
        const categoryIngredients = {
            "Rice": ["Rice", "Tomatoes", "Onions", "Pepper", "Chicken"],
            "Soup": ["Tomatoes", "Pepper", "Onions", "Meat", "Vegetables"],
            "Pasta": ["Pasta", "Tomatoes", "Garlic", "Olive Oil"],
            "Salad": ["Lettuce", "Tomatoes", "Cucumber", "Onions"],
            "Grilled": ["Chicken", "Pepper", "Onions", "Spices"],
            "Fried": ["Plantain", "Yam", "Eggs", "Oil"]
        };
        return categoryIngredients[category] || ["Rice", "Chicken", "Tomatoes"];
    };

    return (
        <div className="home-screen">
            <div className="home-content">
                {/* Header */}
                <div className="header">
                    <div>
                        <p className="greeting">Hello, Chef!</p>
                        <h1 className="title">What do you have?</h1>
                        <p className="subtitle">Snap or type your ingredients</p>
                    </div>
                    <div className="avatar-placeholder">
                        <span>C</span>
                    </div>
                </div>

                {/* Main Actions */}
                <div className="actions-container">
                    <button
                        className="action-button primary"
                        onClick={() => navigate('/camera')}
                    >
                        <Camera size={24} />
                        <span>Snap Ingredients</span>
                    </button>

                    <button
                        className="action-button outlined"
                        onClick={() => navigate('/ingredient-input')}
                    >
                        <Edit3 size={24} />
                        <span>Type Ingredients</span>
                    </button>

                    <button
                        className="action-button surprise"
                        onClick={() => setShowSurpriseModal(true)}
                    >
                        <Sparkles size={24} />
                        <span>Surprise Me</span>
                    </button>
                </div>

                {/* Quick Ingredients */}
                <div className="quick-ingredients-section">
                    <h3 className="section-title">Quick Add</h3>
                    <div className="chips-container">
                        {QUICK_INGREDIENTS.map((item, index) => (
                            <button key={index} className="chip">
                                {item}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Surprise Me Modal */}
            {showSurpriseModal && (
                <div className="modal-overlay" onClick={() => setShowSurpriseModal(false)}>
                    <div className="modal-content slide-up" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Surprise Me! ✨</h2>
                            <button className="close-button" onClick={() => setShowSurpriseModal(false)}>
                                <X size={24} />
                            </button>
                        </div>

                        <p className="modal-subtitle">What are you in the mood for?</p>

                        {/* Meal Type Selection */}
                        <div className="selection-section">
                            <label className="selection-label">MEAL TIME</label>
                            <div className="options-grid">
                                {MEAL_TYPES.map((type) => (
                                    <button
                                        key={type}
                                        className={`option-chip ${selectedMealType === type ? 'selected' : ''}`}
                                        onClick={() => setSelectedMealType(type)}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Food Category Selection */}
                        <div className="selection-section">
                            <label className="selection-label">FOOD TYPE</label>
                            <div className="options-grid">
                                {FOOD_CATEGORIES.map((category) => (
                                    <button
                                        key={category}
                                        className={`option-chip ${selectedCategory === category ? 'selected' : ''}`}
                                        onClick={() => setSelectedCategory(category)}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Generate Button */}
                        <button className="generate-button" onClick={handleSurpriseMe}>
                            <Sparkles size={20} />
                            <span>Generate Recipe</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default HomeScreen;
