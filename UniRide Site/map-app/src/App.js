import React, { useState } from 'react';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import MapComponent from './MapComponent';
import Navbar from './Navbar';
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
    setCurrentView('map');
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

      {/* Show Main Tracking App */}
      {currentView === 'map' && (
        <SearchProvider>
          {/* Pass currentUser to Navbar so it displays their name */}
          <Navbar user={currentUser} />
          <MapComponent />
        </SearchProvider>
      )}

    </div>
  );
}

export default App;