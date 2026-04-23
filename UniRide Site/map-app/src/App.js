import React, { useState } from 'react';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import MapComponent from './MapComponent';
import Navbar from './Navbar';
import EditProfile from './profile';
import { SearchProvider } from './SearchContext';
import './styles.css';

function App() {
  // State to hold the logged-in user's data
  const [currentUser, setCurrentUser] = useState(null);
  
  // State to track which page to show ('login', 'register', or 'map')
  const [currentView, setCurrentView] = useState('login');

  // Helper function to handle successful login
  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    
    // State check to route the user depending on their role
    if (userData.role === 'admin') {
      console.log("Staff logged in!");
      setCurrentView('map'); // TODO: Update this to 'adminDashboard' when ready
    } else if (userData.role === 'driver') {
      console.log("Driver logged in!");
      setCurrentView('map'); // TODO: Update this to 'driverDashboard' when ready
    } else {
      setCurrentView('map'); // Default student view
    }
  };

  return (
    <div className="App">
      
      {/* Show Login Page */}
      {currentView === 'login' && (
        <LoginPage 
          onLoginSuccess={handleLoginSuccess} 
          // When "Sign Up" is clicked, change the view to 'register'
          onShowRegister={() => setCurrentView('register')} 
        />
      )}

      {/* Show Signup Page */}
      {currentView === 'register' && (
        <SignupPage 
          // When "Sign In" is clicked (or after successful signup), go back to 'login'
          onShowLogin={() => setCurrentView('login')} 
        />
      )}

      {/* Show Main Tracking App or profile page */}
      {currentView === 'map' && (
        <SearchProvider>
          {/* Pass currentUser to Navbar and hook up profile click */}
          <Navbar
            user={currentUser}
            onProfileClick={() => setCurrentView('profile')}
          />
          <MapComponent user={currentUser} />
        </SearchProvider>
      )}

      {/* Profile view triggered from navbar */}
      {currentView === 'profile' && (
        <EditProfile 
          user={currentUser}
          onBack={() => setCurrentView('map')} 
          onLogout={() => setCurrentView('login')}
        />
      )}

    </div>
  );
}

export default App;