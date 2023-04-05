import {PreferencesAPI} from '../../db/preferences';

export const CacheAPI = {
  table: 'app.cache',
  path: '/',
  payload: {},
  async init() {
    const cache = await PreferencesAPI.get(this.table);
    if (!cache) return;
    this.path = cache.path;
    this.payload = cache.payload;
  },
  set setPath(path: string) {
    this.path = path;
  },
  set setPayload(payload: string) {
    this.payload = payload;
  },
  get() {
    return {
      path: this.path,
      payload: this.payload,
    };
  },
  async commit() {
    await PreferencesAPI.set(this.table, {
      path: this.path,
      payload: this.payload,
    });
  },
};
