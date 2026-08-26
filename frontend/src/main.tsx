import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeInit } from '../.flowbite-react/init'
import App from './App'
import './index.css'

const contenedor = document.getElementById('root')
if (!contenedor) throw new Error('No se encontro el elemento #root')

createRoot(contenedor).render(
  <StrictMode>
    <ThemeInit />
    <App />
  </StrictMode>,
)
