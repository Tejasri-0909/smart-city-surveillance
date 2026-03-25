import { useState } from 'react';
import './App.css';

function SimpleApp() {
  const [count, setCount] = useState(0);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#1a1a1a',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#00ff88', marginBottom: '20px' }}>
        🏙️ Smart City AI Surveillance System
      </h1>
      
      <div style={{
        background: '#2a2a2a',
        padding: '30px',
        borderRadius: '10px',
        textAlign: 'center',
        maxWidth: '600px'
      }}>
        <h2>✅ System is Working!</h2>
        <p>Frontend server is running successfully on port 5173</p>
        
        <div style={{ margin: '20px 0' }}>
          <button 
            onClick={() => setCount(count + 1)}
            style={{
              background: '#0066cc',
              color: '#fff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Test Counter: {count}
          </button>
        </div>
        
        <div style={{ marginTop: '30px', fontSize: '14px', color: '#888' }}>
          <p>🔧 <strong>Backend:</strong> http://localhost:8000</p>
          <p>🌐 <strong>Frontend:</strong> http://localhost:5173</p>
          <p>📚 <strong>API Docs:</strong> http://localhost:8000/docs</p>
        </div>
        
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          background: '#0a4a0a', 
          borderRadius: '5px',
          border: '1px solid #00ff88'
        }}>
          <p style={{ margin: 0, color: '#00ff88' }}>
            ✅ React app is loading correctly!<br/>
            The infinite reload issue has been fixed.
          </p>
        </div>
      </div>
    </div>
  );
}

export default SimpleApp;