import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Set page title
document.title = 'FEChannel.com - Flat Earth TV Channel';

// Set meta description
const metaDescription = document.querySelector('meta[name="description"]');
if (metaDescription) {
  metaDescription.setAttribute('content', 'The premier destination for Flat Earth content and documentaries. Watch exclusive interviews, educational content, and documentaries on FEChannel.com');
}

// Set viewport meta tag for mobile responsiveness
const viewport = document.querySelector('meta[name="viewport"]');
if (!viewport) {
  const viewportMeta = document.createElement('meta');
  viewportMeta.name = 'viewport';
  viewportMeta.content = 'width=device-width, initial-scale=1.0';
  document.head.appendChild(viewportMeta);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)