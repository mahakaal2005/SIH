import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router/dom'
import './index.css'
import '@/shared/i18n'
import { Boot } from '@/app/Boot'
import { router } from '@/app/router'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Boot>
      <RouterProvider router={router} />
    </Boot>
  </StrictMode>,
)
