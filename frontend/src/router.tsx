import { createBrowserRouter } from 'react-router-dom';
import { RecursiveSorting } from '@/pages/RecursiveSorting';
import { SortingHistoryPage } from '@/pages/SortingHistoryPage';
import { LandingPage } from '@/pages/LandingPage';
import { AboutPage } from '@/pages/AboutPage';
import { ComparisonPage } from '@/pages/ComparisonPage';
import { RootLayout } from '@/components/layout/RootLayout';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <RootLayout />,
        errorElement: <ErrorBoundary />,
        children: [
            {
                index: true,
                element: <LandingPage />,
                errorElement: <ErrorBoundary />
            },
            {
                path: 'explore',
                element: <RecursiveSorting />,
                errorElement: <ErrorBoundary />
            },
            {
                path: 'compare',
                element: <ComparisonPage />,
                errorElement: <ErrorBoundary />
            },
            {
                path: 'history',
                element: <SortingHistoryPage />,
                errorElement: <ErrorBoundary />
            },
            {
                path: 'about',
                element: <AboutPage />,
                errorElement: <ErrorBoundary />
            }
        ]
    }
]); 