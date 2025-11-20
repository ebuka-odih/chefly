import { useState } from 'react';
import { Camera, Sparkles, BookOpen, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './OnboardingScreen.css';

const SLIDES = [
    {
        title: "Snap your food items",
        description: "Take a photo of your yam, plantain, veggies...",
        icon: Camera,
        color: "#FF8A00"
    },
    {
        title: "Get instant meal ideas",
        description: "AI suggests 2–5 meals based on your ingredients.",
        icon: Sparkles,
        color: "#FFB56B"
    },
    {
        title: "Cook with easy steps",
        description: "Simple, beginner-friendly instructions.",
        icon: BookOpen,
        color: "#4CAF50"
    }
];

function OnboardingScreen({ onComplete }) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const navigate = useNavigate();

    const handleNext = () => {
        if (currentSlide < SLIDES.length - 1) {
            setCurrentSlide(currentSlide + 1);
        } else {
            onComplete();
            navigate('/');
        }
    };

    const handleSkip = () => {
        onComplete();
        navigate('/');
    };

    const slide = SLIDES[currentSlide];
    const Icon = slide.icon;

    return (
        <div className="onboarding-screen">
            <button className="skip-button" onClick={handleSkip}>
                Skip
            </button>

            <div className="onboarding-content fade-in">
                <div
                    className="icon-container pulse"
                    style={{ backgroundColor: slide.color }}
                >
                    <Icon size={64} color="#FFFFFF" strokeWidth={2} />
                </div>

                <h1 className="onboarding-title">{slide.title}</h1>
                <p className="onboarding-description">{slide.description}</p>

                <div className="pagination-dots">
                    {SLIDES.map((_, index) => (
                        <div
                            key={index}
                            className={`dot ${index === currentSlide ? 'active' : ''}`}
                            onClick={() => setCurrentSlide(index)}
                        />
                    ))}
                </div>
            </div>

            <button className="next-button" onClick={handleNext}>
                <span>{currentSlide === SLIDES.length - 1 ? 'Get Started' : 'Next'}</span>
                <ChevronRight size={20} />
            </button>
        </div>
    );
}

export default OnboardingScreen;
