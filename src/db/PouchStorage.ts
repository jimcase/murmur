import PouchDB from 'pouchdb';
import find from 'pouchdb-find';
import {IError, IResponse} from './types';
import {Capacitor} from '@capacitor/core';
import {
  CLEAR_DOC_ERROR,
  CLOSE_DOC_ERROR,
  ERROR_CODES,
  GET_DOC_ERROR,
  GET_IDS_ERROR,
  GET_TABLE_ERROR,
  NOT_VALID_ID_DOC_ERROR,
  NOT_VALID_TABLE_NAME_ERROR,
  NULL_OR_EMPTY_DOC_ERROR,
  ON_INIT_DB_ERROR,
  REMOVE_DOC_ERROR,
  SET_DOC_ERROR,
  UPDATE_DOC_ERROR,
} from './errors';
import {PluggableStorage} from './PluggableStorage';
PouchDB.plugin(find);
// required for unit testing
PouchDB.plugin(require('pouchdb-adapter-memory'));
try {
  PouchDB.plugin(require('pouchdb-adapter-indexeddb').default);
} catch {
  // required for unit testing
  PouchDB.plugin(require('pouchdb-adapter-indexeddb'));
}

PouchDB.plugin(require('pouchdb-adapter-cordova-sqlite'));
const resolvePlatform = () => {
  const isMobile =
      Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android';
  if (isMobile) {

    return 'cordova-sqlite'
  } else {

    return 'indexeddb';
  }
}

export class PouchStorage implements PluggableStorage {
  private dbName: string = 'database-dev';
  private db: PouchDB.Database;

  // TODO: types -> 'cordova-sqlite', 'memory', 'indexeddb'
  constructor(dbName?: string, inMemory?: boolean) {
    if (dbName) this.dbName = dbName;
    try {
      const adapter = resolvePlatform();
      this.db = new PouchDB(`${this.dbName}.db`, {
        adapter: inMemory ? 'memory' : adapter,
      });
    } catch (error: any) {
      throw {
        success: false,
        error: {
          ...error,
          description: ON_INIT_DB_ERROR,
        },
      };
    }
  }

  getType(): string {
    return 'pouchdb';
  }

  async init(): Promise<void> {
    // no initialization required for PouchDB
  }

  async getTable(tableName: string): Promise<IResponse> {
    const table = `${tableName}:`;
    return this.db
      .allDocs({
        include_docs: true,
        startkey: table,
        endkey: `${tableName}\uffff`,
      })
      .then((all: {rows: any[]}) => {
        return {
          success: true,
          data: all.rows,
        };
      })
      .catch((error: IError) => {
        return {
          success: false,
          error: {
            ...error,
            description:
              error.status in ERROR_CODES
                ? ERROR_CODES[error.status].description
                : GET_TABLE_ERROR,
          },
        };
      });
  }

  async getIDs(): Promise<IResponse> {
    return this.db
      .allDocs()
      .then((all: {rows: {id: string}[]}) => {
        return {
          success: true,
          data: all.rows.map((d: {id: string}) => d.id),
        };
      })
      .catch((error: IError) => {
        return {
          success: false,
          error: {
            ...error,
            description:
              error.status in ERROR_CODES
                ? ERROR_CODES[error.status].description
                : GET_IDS_ERROR,
          },
        };
      });
  }

  async getTableIDs(tableName?: string): Promise<IResponse> {
    const tableKey = `${tableName}:`;
    const table = await this.getTable(tableKey);

    if (!table.success) return table;

    const result = table.data.map((d: {id: string}) =>
      d.id.replace(tableKey, '')
    );

    return {
      success: true,
      data: result,
    };
  }

  async get(tableName: string, id: string): Promise<IResponse> {
    if (!tableName || tableName.length === 0)
      return {
        success: false,
        error: {
          status: 400,
          description: NOT_VALID_TABLE_NAME_ERROR,
        },
      };

    if (!id || id.length === 0)
      return {
        success: false,
        error: {
          status: 400,
          description: NOT_VALID_ID_DOC_ERROR,
        },
      };

    return this.db
      .get(`${tableName}:${id}`)
      .then((result) => {
        return {
          success: true,
          data: result,
        };
      })
      .catch((error: IError) => {
        return {
          success: false,
          error: {
            ...error,
            description:
              error.status in ERROR_CODES
                ? ERROR_CODES[error.status].description
                : GET_DOC_ERROR,
          },
        };
      });
  }

  async set(tableName: string, id: string, value: any): Promise<IResponse> {
    if (!tableName || tableName.length === 0)
      return {
        success: false,
        error: {
          status: 400,
          description: NOT_VALID_TABLE_NAME_ERROR,
        },
      };

    if (!id || id.length === 0)
      return {
        success: false,
        error: {
          status: 400,
          description: NOT_VALID_ID_DOC_ERROR,
        },
      };

    if (
      !value ||
      (value &&
        Object.keys(value).length === 0 &&
        Object.getPrototypeOf(value) === Object.prototype)
    )
      return {
        success: false,
        error: {
          status: 400,
          description: NULL_OR_EMPTY_DOC_ERROR,
        },
      };
    return this.db
      .put({
        _id: `${tableName}:${id}`,
        ...value,
      })
      .then(() => {
        return {
          success: true,
        };
      })
      .catch(async (error: IError) => {
        if (error.name === 'conflict' && error.status === 409) {
          return this.update(tableName, id, value);
        } else {
          return {
            success: false,
            error: {
              ...error,
              description:
                error.status in ERROR_CODES
                  ? ERROR_CODES[error.status].description
                  : SET_DOC_ERROR,
            },
          };
        }
      });
  }

  async update(tableName: string, id: string, obj: any): Promise<IResponse> {
    return this.get(tableName, id)
      .then((docToUpdate) => {
        if (!docToUpdate.success) return docToUpdate;

        this.db
          .put({
            _id: `${tableName}:${id}`,
            _rev: docToUpdate.data._rev,
            ...obj,
          })
          .then(() => {
            return {
              success: true,
            };
          })
          .catch((error: IError) => {
            return {
              success: false,
              error: {
                ...error,
                description:
                  error.status in ERROR_CODES
                    ? ERROR_CODES[error.status].description
                    : UPDATE_DOC_ERROR,
              },
            };
          });
      })
      .catch((error) => {
        return {
          ...error,
          description: GET_DOC_ERROR,
        };
      });
  }

  async remove(tableName: string, id: string): Promise<IResponse> {
    return this.get(tableName, id)
      .then((doc: IResponse) => {
        if (!doc.success) return doc;

        return this.db
          .remove(doc.data)
          .then(() => {
            return {
              success: true,
            };
          })
          .catch((error: IError) => {
            return {
              success: false,
              error: {
                ...error,
                description:
                  error.status in ERROR_CODES
                    ? ERROR_CODES[error.status].description
                    : REMOVE_DOC_ERROR,
              },
            };
          });
      })
      .catch((error: IError) => {
        return {
          success: false,
          error: {
            ...error,
            description:
              error.status in ERROR_CODES
                ? ERROR_CODES[error.status].description
                : REMOVE_DOC_ERROR,
          },
        };
      });
  }

  async clear(): Promise<IResponse> {
    return this.db
      .destroy()
      .then(() => {
        return {
          success: true,
        };
      })
      .catch((error: IError) => {
        return {
          success: false,
          error: {
            ...error,
            description:
              error.status in ERROR_CODES
                ? ERROR_CODES[error.status].description
                : CLEAR_DOC_ERROR,
          },
        };
      });
  }

  async close(): Promise<IResponse> {
    return this.db
      .close()
      .then(() => {
        return {
          success: true,
        };
      })
      .catch((error: IError) => {
        return {
          success: false,
          error: {
            ...error,
            description:
              error.status in ERROR_CODES
                ? ERROR_CODES[error.status].description
                : CLOSE_DOC_ERROR,
          },
        };
      });
  }
}
