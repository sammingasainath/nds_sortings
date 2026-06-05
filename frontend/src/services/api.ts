import axios from 'axios';
import { College } from '../types';

// Use environment variable or default to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

export const api = {
    getColleges: async (): Promise<College[]> => {
        const response = await axios.get(`${API_BASE_URL}/colleges`);
        return response.data.data;
    },

    getParameters: async (): Promise<string[]> => {
        const response = await axios.get(`${API_BASE_URL}/parameters`);
        return response.data.data;
    }
}; 