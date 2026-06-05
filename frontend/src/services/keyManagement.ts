import { LLMProvider } from './llm/types';

// Simple encryption for API keys (not production-grade security)
const encryptKey = (key: string): string => {
  // This is a simple obfuscation, not true encryption
  // For production, consider using the Web Crypto API
  return btoa(key.split('').reverse().join(''));
};

const decryptKey = (encryptedKey: string): string => {
  try {
    const decoded = atob(encryptedKey);
    return decoded.split('').reverse().join('');
  } catch (error) {
    console.error('Error decrypting key:', error);
    return '';
  }
};

// Storage keys
const STORAGE_PREFIX = 'college_llm_';
const getStorageKey = (provider: LLMProvider) => `${STORAGE_PREFIX}${provider}_api_key`;
const PROVIDER_STORAGE_KEY = `${STORAGE_PREFIX}selected_provider`;
const MODEL_STORAGE_KEY = (provider: LLMProvider) => `${STORAGE_PREFIX}${provider}_model`;

// API key management
export const saveApiKey = (provider: LLMProvider, apiKey: string): void => {
  if (!apiKey) return;
  
  try {
    const encryptedKey = encryptKey(apiKey);
    localStorage.setItem(getStorageKey(provider), encryptedKey);
  } catch (error) {
    console.error('Error saving API key:', error);
  }
};

export const getApiKey = (provider: LLMProvider): string => {
  try {
    const encryptedKey = localStorage.getItem(getStorageKey(provider));
    if (!encryptedKey) return '';
    return decryptKey(encryptedKey);
  } catch (error) {
    console.error('Error retrieving API key:', error);
    return '';
  }
};

export const clearApiKey = (provider: LLMProvider): void => {
  try {
    localStorage.removeItem(getStorageKey(provider));
  } catch (error) {
    console.error('Error clearing API key:', error);
  }
};

// Provider selection
export const saveSelectedProvider = (provider: LLMProvider): void => {
  try {
    localStorage.setItem(PROVIDER_STORAGE_KEY, provider);
  } catch (error) {
    console.error('Error saving selected provider:', error);
  }
};

export const getSelectedProvider = (): LLMProvider => {
  try {
    return (localStorage.getItem(PROVIDER_STORAGE_KEY) as LLMProvider) || 'openai';
  } catch (error) {
    console.error('Error retrieving selected provider:', error);
    return 'openai';
  }
};

// Model selection
export const saveSelectedModel = (provider: LLMProvider, model: string): void => {
  try {
    localStorage.setItem(MODEL_STORAGE_KEY(provider), model);
  } catch (error) {
    console.error('Error saving selected model:', error);
  }
};

export const getSelectedModel = (provider: LLMProvider): string => {
  try {
    const defaultModels: Record<LLMProvider, string> = {
      'openai': 'gpt-3.5-turbo',
      'gemini': 'gemini-pro',
      'groq': 'mixtral-8x7b-32768',
      'on-device': 'gemini-nano'
    };
    
    return localStorage.getItem(MODEL_STORAGE_KEY(provider)) || defaultModels[provider] || '';
  } catch (error) {
    console.error('Error retrieving selected model:', error);
    switch (provider) {
      case 'openai':
        return 'gpt-3.5-turbo';
      case 'gemini':
        return 'gemini-pro';
      case 'groq':
        return 'mixtral-8x7b-32768';
      case 'on-device':
        return 'gemini-nano';
      default:
        return '';
    }
  }
}; 