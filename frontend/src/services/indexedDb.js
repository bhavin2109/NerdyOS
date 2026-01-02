import { openDB } from "idb";

const DB_NAME = "nerdyos-fs";
const DB_VERSION = 1;
const STORE_NAME = "files";

export const initDB = async () => {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, {
                    keyPath: "id",
                });
                store.createIndex("parentId", "parentId", { unique: false });
            }
        },
    });
};

export const createFile = async (file) => {
    const db = await initDB();
    const timestamp = new Date().toISOString();
    const newFile = {
        ...file,
        id: file.id || crypto.randomUUID(),
        createdAt: timestamp,
        updatedAt: timestamp,
    };
    await db.put(STORE_NAME, newFile);
    return newFile;
};

export const updateFile = async (id, data) => {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    const existing = await store.get(id);
    if (!existing) throw new Error("File not found");

    const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
    await store.put(updated);
    await tx.done;
    return updated;
};

export const deleteFile = async (id) => {
    const db = await initDB();
    await db.delete(STORE_NAME, id);
};

export const getFiles = async (parentId = "root") => {
    const db = await initDB();
    return db.getAllFromIndex(STORE_NAME, "parentId", parentId);
};

export const getFile = async (id) => {
    const db = await initDB();
    return db.get(STORE_NAME, id);
};

// Seed initial folders if empty
export const seedFileSystem = async () => {
    const rootFiles = await getFiles("root");
    if (rootFiles.length === 0) {
        // Create default folders
        await createFile({ id: 'documents', parentId: 'root', name: 'Documents', type: 'folder' });
        await createFile({ id: 'pictures', parentId: 'root', name: 'Pictures', type: 'folder' });
        await createFile({ id: 'downloads', parentId: 'root', name: 'Downloads', type: 'folder' });
        await createFile({ id: 'desktop', parentId: 'root', name: 'Desktop', type: 'folder' });
    }
};
