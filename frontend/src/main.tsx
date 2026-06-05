import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { ThemeProvider } from '@/components/ThemeProvider'
import { SortingHistoryProvider } from '@/contexts/SortingHistoryContext'
import { LLMProviderContext } from '@/contexts/LLMContext'
import { ComparisonProvider } from '@/contexts/ComparisonContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="uchit-theme">
      <LLMProviderContext>
        <SortingHistoryProvider>
          <ComparisonProvider>
            <RouterProvider router={router} />
          </ComparisonProvider>
        </SortingHistoryProvider>
      </LLMProviderContext>
    </ThemeProvider>
  </React.StrictMode>,
)
