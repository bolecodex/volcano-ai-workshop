// Local storage utilities for the application

export const storage = {
  // API Key management
  setApiKey: (apiKey) => {
    try {
      localStorage.setItem('seedream_api_key', apiKey);
      return true;
    } catch (error) {
      console.error('Failed to save API key:', error);
      return false;
    }
  },

  getApiKey: () => {
    try {
      return localStorage.getItem('seedream_api_key') || '';
    } catch (error) {
      console.error('Failed to get API key:', error);
      return '';
    }
  },

  removeApiKey: () => {
    try {
      localStorage.removeItem('seedream_api_key');
      return true;
    } catch (error) {
      console.error('Failed to remove API key:', error);
      return false;
    }
  },

  // General settings management
  setSettings: (settings) => {
    try {
      localStorage.setItem('app_settings', JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error('Failed to save settings:', error);
      return false;
    }
  },

  getSettings: () => {
    try {
      const settings = localStorage.getItem('app_settings');
      return settings ? JSON.parse(settings) : {};
    } catch (error) {
      console.error('Failed to get settings:', error);
      return {};
    }
  },

  // Image generation history
  saveGenerationHistory: (history) => {
    try {
      const existingHistory = storage.getGenerationHistory();
      const updatedHistory = [history, ...existingHistory].slice(0, 50); // Keep last 50 generations
      localStorage.setItem('generation_history', JSON.stringify(updatedHistory));
      return true;
    } catch (error) {
      console.error('Failed to save generation history:', error);
      return false;
    }
  },

  getGenerationHistory: () => {
    try {
      const history = localStorage.getItem('generation_history');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Failed to get generation history:', error);
      return [];
    }
  },

  clearGenerationHistory: () => {
    try {
      localStorage.removeItem('generation_history');
      return true;
    } catch (error) {
      console.error('Failed to clear generation history:', error);
      return false;
    }
  }
};
