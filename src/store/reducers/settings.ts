import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../store';

export interface ISettingsState {
  theme: string;
  isDarkMode: boolean;
  isExtension: boolean;
}

const initialState: ISettingsState = {
  theme: 'contrast1',
  isDarkMode: false,
  isExtension: true,
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setSettings: (state, action: PayloadAction<ISettingsState>) => {
      state.theme = action.payload.theme;
      state.isDarkMode = action.payload.isDarkMode;
      state.isExtension = action.payload.isExtension;
    },
    setTheme: (state, action: PayloadAction<ISettingsState>) => {
      state.theme = action.payload.theme;
    },
    setIsDarkMode: (state, action: PayloadAction<ISettingsState>) => {
      state.isDarkMode = action.payload.isDarkMode;
    },
    setIsExtension: (state, action: PayloadAction<ISettingsState>) => {
      state.isExtension = action.payload.isExtension;
    },
  },
});

export const {setSettings, setTheme, setIsDarkMode, setIsExtension} =
  settingsSlice.actions;

export const getSettings = (state: RootState) => state.settings;
export const getTheme = (state: RootState) => state.settings.theme;
export const getIsDarkMode = (state: RootState) => state.settings.isDarkMode;
export const getIsExtension = (state: RootState) => state.settings.isExtension;

export default settingsSlice.reducer;
