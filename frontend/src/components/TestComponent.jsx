import React from 'react';

const TestComponent = () => {
  return (
    <div style={{
      padding: '20px',
      background: '#1a1a1a',
      color: '#fff',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#00d4ff', marginBottom: '20px', fontSize: '32px' }}>
        🎥 Smart City Surveillance System
      </h1>
      <p style={{ color: '#888', marginBottom: '20px', fontSize: '18px' }}>
        System is loading successfully...
      </p>
      <div style={{
        width: '50px',
        height: '50px',
        border: '3px solid #333',
        borderTop: '3px solid #00d4ff',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
      <p style={{ color: '#00ff88', marginTop: '20px', fontSize: '14px' }}>
        ✅ React App is working correctly!
      </p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default TestComponent;