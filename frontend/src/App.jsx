import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './App.css';

// Screens
import SplashScreen from './screens/SplashScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import HomeScreen from './screens/HomeScreen';
import CameraScreen from './screens/CameraScreen';
import IngredientInputScreen from './screens/IngredientInputScreen';
import SuggestionsScreen from './screens/SuggestionsScreen';
import RecipeDetailScreen from './screens/RecipeDetailScreen';
import CookingModeScreen from './screens/CookingModeScreen';
import SavedRecipesScreen from './screens/SavedRecipesScreen';
import HistoryScreen from './screens/HistoryScreen';
import ProfileScreen from './screens/ProfileScreen';

// Layout
import MainLayout from './components/MainLayout';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    // Check if user has seen onboarding
    const onboardingComplete = localStorage.getItem('onboarding_complete');
    setHasSeenOnboarding(!!onboardingComplete);

    // Show splash for 2 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('onboarding_complete', 'true');
    setHasSeenOnboarding(true);
  };

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <Router>
      <Routes>
        {/* Onboarding */}
        <Route
          path="/onboarding"
          element={
            hasSeenOnboarding ?
              <Navigate to="/" replace /> :
              <OnboardingScreen onComplete={handleOnboardingComplete} />
          }
        />

        {/* Main App with Bottom Navigation */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomeScreen />} />
          <Route path="saved" element={<SavedRecipesScreen />} />
          <Route path="history" element={<HistoryScreen />} />
          <Route path="profile" element={<ProfileScreen />} />
        </Route>

        {/* Full Screen Routes (No Bottom Nav) */}
        <Route path="/camera" element={<CameraScreen />} />
        <Route path="/ingredient-input" element={<IngredientInputScreen />} />
        <Route path="/suggestions" element={<SuggestionsScreen />} />
        <Route path="/recipe/:id" element={<RecipeDetailScreen />} />
        <Route path="/cooking-mode/:id" element={<CookingModeScreen />} />

        {/* Redirect to onboarding if not completed */}
        <Route
          path="*"
          element={
            <Navigate to={hasSeenOnboarding ? "/" : "/onboarding"} replace />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
