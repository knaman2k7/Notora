import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "./index.css"
import App from './App.jsx'


const originalFetch = window.fetch;

window.fetch = async (...args) => {
  const response = await originalFetch(...args);
  if (response.status === 403) {
    localStorage.removeItem("token");
    window.location.href = "/dashboard";
  }
  return response;
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
