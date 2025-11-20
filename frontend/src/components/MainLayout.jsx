import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, Bookmark, Clock, User } from 'lucide-react';
import './MainLayout.css';

const TABS = [
    { name: 'Home', icon: Home, route: '/' },
    { name: 'Ideas', icon: Bookmark, route: '/saved' },
    { name: 'History', icon: Clock, route: '/history' },
    { name: 'Profile', icon: User, route: '/profile' },
];

function MainLayout() {
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <div className="main-layout">
            <div className="main-content">
                <Outlet />
            </div>

            <nav className="bottom-nav">
                {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = location.pathname === tab.route;

                    return (
                        <button
                            key={tab.route}
                            className={`nav-tab ${isActive ? 'active' : ''}`}
                            onClick={() => navigate(tab.route)}
                        >
                            <Icon
                                size={24}
                                strokeWidth={isActive ? 2.5 : 2}
                            />
                            <span className="nav-label">{tab.name}</span>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}

export default MainLayout;
