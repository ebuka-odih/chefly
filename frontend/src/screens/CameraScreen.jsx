import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, ArrowLeft, Check, X } from 'lucide-react';
import { detectIngredients } from '../services/api';
import './CameraScreen.css';

function CameraScreen() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [detectedIngredients, setDetectedIngredients] = useState([]);
    const [selectedIngredients, setSelectedIngredients] = useState([]);
    const [isDetecting, setIsDetecting] = useState(false);

    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setCapturedImage(imageUrl);

            // Detect ingredients
            setIsDetecting(true);
            try {
                const result = await detectIngredients(file);
                const ingredients = result.ingredients || [];
                setDetectedIngredients(ingredients);
                setSelectedIngredients(ingredients);
            } catch (error) {
                console.error('Detection failed:', error);
            } finally {
                setIsDetecting(false);
            }
        }
    };

    const toggleIngredient = (ingredient) => {
        setSelectedIngredients(prev =>
            prev.includes(ingredient)
                ? prev.filter(i => i !== ingredient)
                : [...prev, ingredient]
        );
    };

    const handleGenerateMeals = () => {
        if (selectedIngredients.length > 0) {
            navigate('/suggestions', {
                state: {
                    ingredients: selectedIngredients,
                    preferences: {
                        cuisine: "Nigerian",
                        spice_level: "Medium",
                        max_time: 60
                    }
                }
            });
        }
    };

    const handleRetake = () => {
        setCapturedImage(null);
        setDetectedIngredients([]);
        setSelectedIngredients([]);
    };

    return (
        <div className="camera-screen">
            <div className="camera-header">
                <button className="back-button" onClick={() => navigate(-1)}>
                    <ArrowLeft size={24} />
                </button>
                <h2>Snap Ingredients</h2>
                <div style={{ width: 24 }} /> {/* Spacer */}
            </div>

            {!capturedImage ? (
                <div className="camera-placeholder">
                    <div className="camera-icon-container">
                        <Camera size={64} strokeWidth={1.5} />
                    </div>
                    <h3>Take a Photo of Your Ingredients</h3>
                    <p>We'll detect what you have and suggest meals</p>

                    <div className="camera-actions">
                        <button
                            className="capture-button"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Camera size={24} />
                            <span>Choose Photo</span>
                        </button>

                        <button
                            className="upload-button"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload size={24} />
                            <span>Upload from Gallery</span>
                        </button>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                    />
                </div>
            ) : (
                <div className="detection-result fade-in">
                    <div className="captured-image-container">
                        <img src={capturedImage} alt="Captured ingredients" />
                        <button className="retake-button" onClick={handleRetake}>
                            Retake
                        </button>
                    </div>

                    {isDetecting ? (
                        <div className="detecting-state">
                            <div className="loading-spinner"></div>
                            <p>Detecting ingredients...</p>
                        </div>
                    ) : (
                        <div className="ingredients-section">
                            <h3>Detected Ingredients</h3>
                            <p className="ingredients-hint">Tap to select/deselect</p>

                            <div className="ingredients-list">
                                {detectedIngredients.map((ingredient, index) => (
                                    <button
                                        key={index}
                                        className={`ingredient-item ${selectedIngredients.includes(ingredient) ? 'selected' : ''}`}
                                        onClick={() => toggleIngredient(ingredient)}
                                    >
                                        <span>{ingredient}</span>
                                        {selectedIngredients.includes(ingredient) ? (
                                            <Check size={20} />
                                        ) : (
                                            <X size={20} className="deselected-icon" />
                                        )}
                                    </button>
                                ))}
                            </div>

                            <button
                                className="generate-meals-button"
                                onClick={handleGenerateMeals}
                                disabled={selectedIngredients.length === 0}
                            >
                                Generate Meal Ideas ({selectedIngredients.length})
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default CameraScreen;
