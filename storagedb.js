class StorageDB {
    constructor (database) {
        if (!database || typeof database !== 'string') {
            throw new TypeError('parameter 1 must be a non-empty string!');
        }
        this.#database = database;
    }
    version = '0.5';
    #data = new Map();
    #database;
    #db;
    #transaction (callback) {
        return new Promise(async (resolve, reject) => {
            let transaction = this.#db.transaction('storage', 'readwrite');
            let store = transaction.objectStore('storage');
            let request = callback(store);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    open () {
        return new Promise((resolve, reject) => {
            let request = indexedDB.open(this.#database, 1);
            request.onsuccess = () => {
                this.#db = request.result;
                this.#transaction((store) => store.getAll()).then((storage) => {
                    storage.forEach(({ key, value }) => this.#data.set(key, value));
                    resolve(true);
                });
            }
            request.onupgradeneeded = (event) => request.result.createObjectStore('storage', { keyPath: 'key' });
            request.onerror = () => reject(request.error);
        });
    }
    close () {
        return new Promise((resolve) => {
            this.#db.close();
            this.#data.clear();
            resolve(true);
        });
    }
    set (key, value) {
        return this.#transaction((store) => store.put({ key, value })).then(() => this.#data.set(key, value) && { key, value });
    }
    has (key) {
        return this.#data.has(key);
    }
    get (key) {
        return this.#data.get(key);
    }
    delete (key) {
        return this.#transaction((store) => store.delete(key)).then(() => !!this.#data.delete(key));
    }
    entries () {
        return [...this.#data];
    }
    keys () {
        return [...this.#data.keys()];
    }
    values () {
        return [...this.#data.values()];
    }
    forEach (callback) {
        this.#data.forEach((value, key) => callback({ key, value }));
    }
    clear () {
        return this.#transaction((store) => store.clear()).then(() => !!this.#data.clear());
    }
    flush () {
        return new Promise(async (resolve, reject) => {
            await this.close();
            let request = indexedDB.deleteDatabase(this.#database);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
}
