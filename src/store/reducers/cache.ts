import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../store';

export interface ICacheState {
  path: string;
  payload: any;
}

const initialState: ICacheState = {
  path: '/',
  payload: {},
};

export const cacheSlice = createSlice({
  name: 'cache',
  initialState,
  reducers: {
    setCache: (state, action: PayloadAction<ICacheState>) => {
      state.path = action.payload.path;
      state.payload = action.payload.payload;
    },
    setPathInCache: (state, action: PayloadAction<ICacheState>) => {
      state.path = action.payload.path;
    },
    setPayloadInCache: (state, action: PayloadAction<ICacheState>) => {
      state.payload = action.payload.payload;
    },
  },
});

export const {setCache, setPathInCache, setPayloadInCache} = cacheSlice.actions;

export const getCache = (state: RootState) => state.cache;
export const getCachedPath = (state: RootState) => state.cache.path;
export const getCachedPayload = (state: RootState) => state.cache.payload;

export default cacheSlice.reducer;
