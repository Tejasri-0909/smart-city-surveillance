// Simple test component to check if React is working
function TestApp() {
  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#0a0a0a',
      color: '#00ff88',
      fontSize: '24px'
    }}>
      <div>
        <h1>🚀 Smart City Surveillance System</h1>
        <p>✅ React is working!</p>
        <p>✅ Vite server is running!</p>
        <p>📍 Check console for any errors</p>
      </div>
    </div>
  );
}

export default TestApp;