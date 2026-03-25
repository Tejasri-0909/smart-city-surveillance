import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import SimpleApp from './SimpleApp.jsx'
// import TestApp from './TestApp.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

// Use full App now that reload issue is fixed
const AppToRender = App; // SimpleApp for testing, App for full system

createRoot(document.getElementById('root')).render(
  // Temporarily disable StrictMode to prevent reload loops
  <ErrorBoundary>
    <AppToRender />
  </ErrorBoundary>
)
