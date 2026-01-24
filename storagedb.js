class StorageDB {
    static #ready = false;
    #data = new Map();
    #db;

    constructor() {
        if (StorageDB.#ready) {
            throw new SyntaxError('StorageDB is a singleton. Creating multiple instances is not allowed.');
        }
        StorageDB.#ready = true;
    }

    #transaction(callback) {
        return new Promise((resolve, reject) => {
            let tx = this.#db.transaction('storage', 'readwrite');
            let store = tx.objectStore('storage');
            let request = callback(store);
            tx.oncomplete = () => resolve(request.result);
            tx.onerror = () => reject(request.error || tx.error);
            tx.onabort = () => reject(request.error || tx.error);
            request.onerror = () => reject(request.error);
        });
    }

    async open() {
        let request = indexedDB.open('__StorageDB__', 1);
        let db = await new Promise((resolve, reject) => {
            request.onupgradeneeded = () => request.result.createObjectStore('storage', { keyPath: 'key' });
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
        db.onversionchange = () => db.close();
        await Promise.resolve();
        this.#db = db;
        let data = await this.#transaction((store) => store.getAll());
        for (let { key, value } of data) {
            this.#data.set(key, value);
        }
        return true;
    }

    async close() {
        this.#db.close();
        this.#data.clear();
        return true;
    }

    has(key) {
        return this.#data.has(key);
    }

    async set(key, value) {
        await this.#transaction(store => store.put({ key, value }));
        this.#data.set(key, value);
        return { key, value };
    }

    get(key) {
        return this.#data.get(key);
    }

    async delete(key) {
        await this.#transaction((store) => store.delete(key));
        this.#data.delete(key);
        return true;
    }

    entries() {
        return Object.fromEntries(this.#data);
    }

    keys() {
        return [...this.#data.keys()];
    }

    values() {
        return [...this.#data.values()];
    }

    forEach(callback) {
        for (let [key, value] of this.#data) {
            callback({ key, value });
        }
    }

    async clear() {
        await this.#transaction((store) => store.clear());
        this.#data = new Map();
        return true;
    }

    async destroy() {
        await this.close();
        return new Promise((resolve, reject) => {
            let request = indexedDB.deleteDatabase('__StorageDB__');
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }
}
