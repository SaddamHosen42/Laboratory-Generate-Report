import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ReactToPrint from './components/ReactToPrint.jsx';
import { createBrowserRouter, RouterProvider } from 'react-router';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />
  },
  {
    path: "/lab-form",
    element: <App />
  },
  {
    path: "/print-report",
    element: <ReactToPrint />
  }

]);
createRoot(document.getElementById('root')).render(
  <StrictMode>
     <RouterProvider router={router} />
  </StrictMode>,
)
