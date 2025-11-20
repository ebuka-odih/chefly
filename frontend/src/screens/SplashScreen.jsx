import { ChefHat } from 'lucide-react';
import './SplashScreen.css';

function SplashScreen() {
    return (
        <div className="splash-screen">
            <div className="splash-content fade-in">
                <div className="logo-container pulse">
                    <ChefHat size={80} strokeWidth={2} color="#FFFFFF" />
                </div>
                <h1 className="app-title">ChopWhat</h1>
                <p className="app-subtitle">What can you cook today?</p>
            </div>
        </div>
    );
}

export default SplashScreen;
