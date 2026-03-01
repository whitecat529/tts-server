class TTSDatabase {
  constructor() {
    this.dbName = "ttsDB";
    this.storeName = "audios";
    this.db = null;
  }

  // 初始化数据库
  init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, {
            keyPath: "id"
          });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve();
      };

      request.onerror = () => {
        reject("IndexedDB 初始化失败");
      };
    });
  }

  // 存数据
  set(data) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(this.storeName, "readwrite");
      const store = tx.objectStore(this.storeName);

      const request = store.put(data);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject("写入失败");
    });
  }

  // 取数据
  get(id) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(this.storeName, "readonly");
      const store = tx.objectStore(this.storeName);

      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject("读取失败");
    });
  }

  // 删除数据
  delete(id) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(this.storeName, "readwrite");
      const store = tx.objectStore(this.storeName);

      const request = store.delete(id);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject("删除失败");
    });
  }
}

export default TTSDatabase;