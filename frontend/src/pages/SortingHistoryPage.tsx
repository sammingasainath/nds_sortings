import React from 'react';
import { SortingHistoryView } from '@/components/SortingHistory';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';

export const SortingHistoryPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Layout>
            <div className="container mx-auto py-10 px-4 max-w-[1400px]">
                <div className="flex items-center gap-4 mb-8">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/')}
                        className="gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Sorting
                    </Button>
                    <h1 className="text-4xl font-bold tracking-tight text-primary">
                        Sorting History
                    </h1>
                </div>
                
                <div className="max-w-2xl mx-auto">
                    <SortingHistoryView />
                </div>
            </div>
        </Layout>
    );
}; 