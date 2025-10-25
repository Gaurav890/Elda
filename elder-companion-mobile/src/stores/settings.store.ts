/**
 * Settings Store
 * App settings and preferences
 */

import { create } from 'zustand';
import { storageService } from '../services/storage.service';
import { AppSettings } from '../types';

interface SettingsState extends AppSettings {
  // Actions
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  loadSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  volume: 0.8,
  ttsRate: 0.9,
  language: 'en-US',

  updateSettings: async settings => {
    const currentSettings = {
      volume: get().volume,
      ttsRate: get().ttsRate,
      language: get().language,
    };

    const newSettings = { ...currentSettings, ...settings };
    await storageService.setSettings(newSettings);
    set(newSettings);
  },

  loadSettings: async () => {
    const settings = await storageService.getSettings();
    set(settings);
  },
}));
