import React from 'react';

const WorkdeckApp = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f0f9ff',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h1 style={{ color: '#1e40af', marginBottom: '1rem' }}>
          🎉 SUCCESS! 🎉
        </h1>
        <p style={{ color: '#374151', fontSize: '1.2rem' }}>
          Your WorkdeckApp is now loading correctly!
        </p>
        <p style={{ color: '#6b7280', marginTop: '1rem' }}>
          This proves the build pipeline and component routing works.
        </p>
      </div>
    </div>
  );
};

export default WorkdeckApp;
