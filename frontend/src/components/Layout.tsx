import React from 'react';
import { useLLM } from '@/contexts/LLMContext';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-background relative">
            {children}
        </div>
    );
}; 