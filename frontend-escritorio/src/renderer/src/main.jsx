import './assets/main.css'
import './style.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <div className="min-h-screen w-full flex items-stretch justify-center bg-gradient-to-br from-orange-100 via-black to-blue-100 text-gray-900">
      <App />
    </div>
  </StrictMode>
)
