import React from 'react';
import MapComponent from './MapComponent';
import Navbar from './Navbar';
import { SearchProvider } from './SearchContext';
import './styles.css';

function App() {
  return (
    <SearchProvider>
      <div className="App">
        <Navbar />
        <MapComponent />
      </div>
    </SearchProvider>
  );
}

export default App;