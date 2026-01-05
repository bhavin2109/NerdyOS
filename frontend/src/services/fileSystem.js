import { openDB } from "idb";

const DB_NAME = "NerdyOS_VFS";
const STORE_NAME = "files";

// Initial file structure to bootstrap if empty
const INITIAL_STRUCTURE = [
    { path: "/home", name: "home", type: "directory" },
    { path: "/home/desktop", name: "desktop", type: "directory" },
    { path: "/home/documents", name: "documents", type: "directory" },
    { path: "/home/downloads", name: "downloads", type: "directory" },
    { path: "/home/pictures", name: "pictures", type: "directory" },
    { path: "/home/music", name: "music", type: "directory" },
    { path: "/home/videos", name: "videos", type: "directory" },
    { path: "/home/documents/welcome.txt", name: "welcome.txt", type: "file", content: "Welcome to NerdyOS!\n\nThis is a fully functional web-based OS.\nTry opening the Terminal and running 'help'." },
];

class FileSystem {
    constructor() {
        this.dbPromise = openDB(DB_NAME, 1, {
            upgrade(db) {
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const store = db.createObjectStore(STORE_NAME, { keyPath: "path" });
                    store.createIndex("parent", "parent");

                    // Seed initial data
                    INITIAL_STRUCTURE.forEach(item => {
                        const parent = item.path.substring(0, item.path.lastIndexOf("/")) || "/";
                        store.put({ ...item, parent: parent === "" ? null : parent });
                    });

                    // Manually ensure root exists
                    store.put({ path: "/", name: "root", type: "directory", parent: null });
                }
            },
        });
    }

    async ready() {
        return this.dbPromise;
    }

    // Get file or directory metadata
    async stat(path) {
        const db = await this.dbPromise;
        return db.get(STORE_NAME, path);
    }

    // List directory contents
    async ls(path) {
        const db = await this.dbPromise;
        // Normalize path to remove trailing slash unless root
        const normalizedPath = path === "/" ? path : path.replace(/\/$/, "");
        return db.getAllFromIndex(STORE_NAME, "parent", normalizedPath);
    }

    // Create directory
    async mkdir(path) {
        const db = await this.dbPromise;
        if (await this.stat(path)) {
            throw new Error(`pool: ${path}: File exists`);
        }

        const parent = path.substring(0, path.lastIndexOf("/")) || "/";
        const name = path.split("/").pop();

        // Check if parent exists
        if (parent !== "/" && !(await this.stat(parent))) {
            throw new Error(`mkdir: cannot create directory '${path}': No such file or directory`);
        }

        await db.put(STORE_NAME, {
            path,
            name,
            type: "directory",
            parent,
            createdAt: new Date(),
        });
    }

    // Write file
    async writeFile(path, content) {
        const db = await this.dbPromise;
        const parent = path.substring(0, path.lastIndexOf("/")) || "/";
        const name = path.split("/").pop();

        if (parent !== "/" && !(await this.stat(parent))) {
            throw new Error(`write: cannot create file '${path}': No such directory`);
        }

        await db.put(STORE_NAME, {
            path,
            name,
            type: "file",
            content,
            parent,
            updatedAt: new Date(),
        });
    }

    // Read file
    async readFile(path) {
        const item = await this.stat(path);
        if (!item) throw new Error(`cat: ${path}: No such file or directory`);
        if (item.type === "directory") throw new Error(`cat: ${path}: Is a directory`);
        return item.content;
    }

    // Remove file or directory
    async rm(path) {
        const db = await this.dbPromise;
        const item = await this.stat(path);
        if (!item) throw new Error(`rm: ${path}: No such file or directory`);

        if (item.type === "directory") {
            // Check if empty
            const children = await this.ls(path);
            if (children.length > 0) {
                throw new Error(`rm: cannot remove '${path}': Directory not empty`);
            }
        }

        await db.delete(STORE_NAME, path);
    }
}

export const fs = new FileSystem();
export default fs;
