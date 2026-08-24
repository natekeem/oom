import type { OomVoiceId } from "./types";

export const MAX_PERSISTENT_AUDIO_CACHE_ENTRIES = 24;

const DATABASE_NAME = "oom-tts-audio-cache";
const DATABASE_VERSION = 1;
const STORE_NAME = "audio";
const LAST_ACCESSED_INDEX = "lastAccessedAt";

export type PersistentAudioCacheRecord = {
  key: string;
  blob: Blob;
  createdAt: number;
  lastAccessedAt: number;
  byteSize: number;
  modelVersion: string;
  voice: OomVoiceId;
  rate: number;
  textHash: string;
  audioDurationSeconds?: number;
  chunkCount?: number;
};

export type PersistentAudioCache = {
  get: (key: string) => Promise<PersistentAudioCacheRecord | null>;
  set: (record: PersistentAudioCacheRecord) => Promise<void>;
  clear?: () => Promise<void>;
};

export function selectPersistentCacheKeysForEviction(
  records: ReadonlyArray<Pick<PersistentAudioCacheRecord, "key" | "createdAt" | "lastAccessedAt">>,
  maxEntries = MAX_PERSISTENT_AUDIO_CACHE_ENTRIES,
) {
  const overflow = Math.max(0, records.length - maxEntries);
  if (overflow === 0) return [];

  return [...records]
    .sort(
      (left, right) =>
        left.lastAccessedAt - right.lastAccessedAt ||
        left.createdAt - right.createdAt ||
        left.key.localeCompare(right.key),
    )
    .slice(0, overflow)
    .map((record) => record.key);
}

function isCacheRecord(value: unknown): value is PersistentAudioCacheRecord {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<PersistentAudioCacheRecord>;
  return (
    typeof record.key === "string" &&
    record.blob instanceof Blob &&
    typeof record.createdAt === "number" &&
    typeof record.lastAccessedAt === "number" &&
    typeof record.byteSize === "number" &&
    typeof record.modelVersion === "string" &&
    typeof record.voice === "string" &&
    typeof record.rate === "number" &&
    typeof record.textHash === "string"
  );
}

export class IndexedDbAudioCache implements PersistentAudioCache {
  private databasePromise: Promise<IDBDatabase> | null = null;

  private openDatabase() {
    if (this.databasePromise) return this.databasePromise;

    this.databasePromise = new Promise<IDBDatabase>((resolve, reject) => {
      if (typeof indexedDB === "undefined") {
        reject(new Error("IndexedDB를 사용할 수 없습니다."));
        return;
      }

      const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
      request.onupgradeneeded = () => {
        const database = request.result;
        const store = database.objectStoreNames.contains(STORE_NAME)
          ? request.transaction?.objectStore(STORE_NAME)
          : database.createObjectStore(STORE_NAME, { keyPath: "key" });
        if (store && !store.indexNames.contains(LAST_ACCESSED_INDEX)) {
          store.createIndex(LAST_ACCESSED_INDEX, LAST_ACCESSED_INDEX);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error("TTS cache를 열 수 없습니다."));
      request.onblocked = () => reject(new Error("TTS cache upgrade가 차단되었습니다."));
    }).catch((error) => {
      this.databasePromise = null;
      throw error;
    });

    return this.databasePromise;
  }

  async get(key: string) {
    const database = await this.openDatabase();

    return new Promise<PersistentAudioCacheRecord | null>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);
      let result: PersistentAudioCacheRecord | null = null;

      request.onsuccess = () => {
        if (!isCacheRecord(request.result)) {
          if (typeof request.result !== "undefined") store.delete(key);
          return;
        }

        result = { ...request.result, lastAccessedAt: Date.now() };
        store.put(result);
      };
      request.onerror = () => reject(request.error ?? new Error("TTS cache를 읽을 수 없습니다."));
      transaction.oncomplete = () => resolve(result);
      transaction.onerror = () => reject(transaction.error ?? new Error("TTS cache read transaction이 실패했습니다."));
      transaction.onabort = () => reject(transaction.error ?? new Error("TTS cache read transaction이 중단되었습니다."));
    });
  }

  async set(record: PersistentAudioCacheRecord) {
    const database = await this.openDatabase();

    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      store.put(record);

      const allRequest = store.getAll();
      allRequest.onsuccess = () => {
        const records = (allRequest.result as unknown[]).filter(isCacheRecord);
        selectPersistentCacheKeysForEviction(records).forEach((key) => store.delete(key));
      };
      allRequest.onerror = () => reject(allRequest.error ?? new Error("TTS cache 목록을 읽을 수 없습니다."));
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("TTS cache write transaction이 실패했습니다."));
      transaction.onabort = () => reject(transaction.error ?? new Error("TTS cache write transaction이 중단되었습니다."));
    });
  }

  async clear() {
    const database = await this.openDatabase();

    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).clear();
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("TTS cache clear가 실패했습니다."));
      transaction.onabort = () => reject(transaction.error ?? new Error("TTS cache clear가 중단되었습니다."));
    });
  }
}
