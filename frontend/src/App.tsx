import { LLMProviderContext } from '@/contexts/LLMContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import { router } from './router';
import { RouterProvider } from 'react-router-dom';

function App() {
    return (
        <LLMProviderContext>
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>
        </LLMProviderContext>
    );
}

export default App;
