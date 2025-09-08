import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Login from './pages/Login'
import ProjectSetup from './pages/ProjectSetup'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import ExportPage from './pages/Export'

const router = createBrowserRouter([
  { path: '/', element: <Login /> },
  { path: '/setup', element: <ProjectSetup /> },
  { path: '/dashboard', element: <Dashboard /> },
  { path: '/chat', element: <Chat /> },
  { path: '/export', element: <ExportPage /> },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
