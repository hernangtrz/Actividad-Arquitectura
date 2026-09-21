import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles.css'
import { iniciarSuscriptorNotificaciones } from './patterns/notificacionesSubscriber.js'

// Inicializar suscriptores de eventos desacoplados
iniciarSuscriptorNotificaciones()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
