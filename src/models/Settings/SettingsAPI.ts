import {PreferencesAPI} from '../../db/preferences';

export const SettingsAPI = {
  table: 'settings',
  theme: 'contrast',
  isDarkMode: false,
  isExtension: false,
  async init() {
    const settings = await PreferencesAPI.get(this.table);
    if (!settings) return;
    this.theme = settings.theme;
    this.isDarkMode = settings.isDarkMode;
    this.isExtension = settings.isExtension;
  },
  setTheme(theme: string) {
    this.theme = theme;
  },
  setIsDarkMode(isDark: boolean) {
    this.isDarkMode = isDark;
  },
  setIsExtension(isExtension: boolean) {
    this.isExtension = isExtension;
  },
  getTheme() {
    return this.theme;
  },
  getIsDarkMode() {
    return this.isDarkMode;
  },
  get() {
    return {
      theme: this.theme,
      isDarkMode: this.isDarkMode,
      isExtension: this.isExtension,
    };
  },
  async commit() {
    await PreferencesAPI.set(this.table, {
      theme: this.theme,
      isDarkMode: this.isDarkMode,
      isExtension: this.isExtension,
    });
  },
};
