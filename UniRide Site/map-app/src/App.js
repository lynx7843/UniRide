import React, { useState } from 'react';
import LoginPage from './LoginPage';
import MapComponent from './MapComponent';
import Navbar from './Navbar';
import { SearchProvider } from './SearchContext';
import './styles.css';

function App() {
  // State to hold the logged-in user's data
  const [currentUser, setCurrentUser] = useState(null);

  return (
    <div className="App">
      {!currentUser ? (
        // If no user is logged in, show the login page
        <LoginPage onLoginSuccess={(userData) => setCurrentUser(userData)} />
      ) : (
        // If logged in, show the actual tracking app
        <SearchProvider>
          {/* You can optionally pass currentUser to Navbar so it displays their name */}
          <Navbar user={currentUser} />
          <MapComponent />
        </SearchProvider>
      )}
    </div>
  );
}

export default App;