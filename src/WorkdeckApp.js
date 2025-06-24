import React from 'react';

const WorkdeckApp = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#ff0000',  // Bright red background
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h1 style={{ fontSize: '3rem' }}>
          🔥 TESTING 123 🔥
        </h1>
        <p style={{ fontSize: '2rem' }}>
          Current time: {new Date().toLocaleTimeString()}
        </p>
        <p>If you see this red screen, the update worked!</p>
      </div>
    </div>
  );
};

export default WorkdeckApp;
