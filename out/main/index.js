"use strict";
const electron = require("electron");
const path = require("path");
const fs = require("fs");
const git = require("isomorphic-git");
const FlexSearch = require("flexsearch");
function _interopNamespaceDefault(e) {
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
const fs__namespace = /* @__PURE__ */ _interopNamespaceDefault(fs);
const git__namespace = /* @__PURE__ */ _interopNamespaceDefault(git);
class FileService {
  userDataPath;
  constructor() {
    this.userDataPath = electron.app.getPath("userData");
    this.ensureDirectories();
  }
  /**
   * 确保必要的目录存在
   * 如果目录不存在则创建
   */
  ensureDirectories() {
    const dirs = [
      path.join(this.userDataPath, "notes"),
      path.join(this.userDataPath, "categories"),
      path.join(this.userDataPath, "assets"),
      path.join(this.userDataPath, ".git")
    ];
    dirs.forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.promises.mkdir(dir, { recursive: true }).catch(console.error);
      }
    });
  }
  /**
   * 读取文件内容
   * @param filePath 文件相对路径
   * @returns 文件内容字符串
   */
  async readFile(filePath) {
    try {
      const fullPath = path.join(this.userDataPath, filePath);
      return await fs.promises.readFile(fullPath, "utf-8");
    } catch (error) {
      console.error("Error reading file:", error);
      throw error;
    }
  }
  /**
   * 写入文件内容
   * @param filePath 文件相对路径
   * @param content 要写入的内容
   */
  async writeFile(filePath, content) {
    try {
      const fullPath = path.join(this.userDataPath, filePath);
      const dir = path.join(fullPath, "..");
      if (!fs.existsSync(dir)) {
        await fs.promises.mkdir(dir, { recursive: true });
      }
      await fs.promises.writeFile(fullPath, content, "utf-8");
    } catch (error) {
      console.error("Error writing file:", error);
      throw error;
    }
  }
  /**
   * 删除文件
   * @param filePath 文件相对路径
   */
  async deleteFile(filePath) {
    try {
      const fullPath = path.join(this.userDataPath, filePath);
      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath);
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      throw error;
    }
  }
  /**
   * 列出目录中的文件
   * @param dirPath 目录相对路径
   * @returns 文件名数组，只包含 .md 和 .json 文件
   */
  async listFiles(dirPath) {
    try {
      const fullPath = path.join(this.userDataPath, dirPath);
      if (!fs.existsSync(fullPath)) {
        return [];
      }
      const files = await fs.promises.readdir(fullPath);
      return files.filter((file) => file.endsWith(".md") || file.endsWith(".json"));
    } catch (error) {
      console.error("Error listing files:", error);
      return [];
    }
  }
  /**
   * 检查文件是否存在
   * @param filePath 文件相对路径
   * @returns 文件是否存在
   */
  async fileExists(filePath) {
    const fullPath = path.join(this.userDataPath, filePath);
    return fs.existsSync(fullPath);
  }
  /**
   * 保存资源文件（图片等）
   * @param fileName 文件名
   * @param data 文件数据
   * @returns 资源文件访问路径
   */
  async saveAsset(fileName, data) {
    const assetsDir = path.join(this.userDataPath, "assets");
    if (!fs.existsSync(assetsDir)) {
      await fs.promises.mkdir(assetsDir, { recursive: true });
    }
    const filePath = path.join(assetsDir, fileName);
    await fs.promises.writeFile(filePath, data);
    return `assets:///${fileName}`;
  }
  /**
   * 获取资源文件的完整路径
   * @param fileName 文件名
   * @returns 完整路径
   */
  getAssetPath(fileName) {
    return path.join(this.userDataPath, "assets", fileName);
  }
  /**
   * 获取笔记目录的完整路径
   * @returns 笔记目录路径
   */
  getNotesPath() {
    return path.join(this.userDataPath, "notes");
  }
  /**
   * 获取用户数据目录路径
   * @returns 用户数据目录路径
   */
  getUserDataPath() {
    return this.userDataPath;
  }
}
const FileService$1 = new FileService();
function generateId() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : r & 3 | 8;
    return v.toString(16);
  });
}
class NoteService {
  /**
   * 创建新笔记
   * @param title 笔记标题，默认为 "Untitled Note"
   * @returns 创建的笔记对象
   */
  async createNote(title = "Untitled Note") {
    const id = generateId();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const note = {
      id,
      title,
      content: "",
      markdown: "",
      category: "Uncategorized",
      tags: [],
      createdAt: now,
      updatedAt: now
    };
    await this.saveNote(note);
    return note;
  }
  /**
   * 保存笔记到文件
   * 使用 frontmatter 格式保存元数据和内容
   * @param note 要保存的笔记对象
   */
  async saveNote(note) {
    const filePath = `notes/${note.id}.md`;
    const frontmatter = `---
title: ${note.title}
category: ${note.category}
tags: ${JSON.stringify(note.tags)}
createdAt: ${note.createdAt}
updatedAt: ${note.updatedAt}
---

${note.markdown}
`;
    await FileService$1.writeFile(filePath, frontmatter);
  }
  /**
   * 根据 ID 获取笔记
   * @param id 笔记 ID
   * @returns 笔记对象，如果不存在则返回 null
   */
  async getNote(id) {
    try {
      const filePath = `notes/${id}.md`;
      const content = await FileService$1.readFile(filePath);
      return this.parseNote(id, content);
    } catch (error) {
      console.error("Error getting note:", error);
      return null;
    }
  }
  /**
   * 获取所有笔记
   * @returns 笔记数组，按更新时间降序排列
   */
  async getAllNotes() {
    try {
      const files = await FileService$1.listFiles("notes");
      const notes = [];
      for (const file of files) {
        const id = file.replace(".md", "");
        const note = await this.getNote(id);
        if (note) {
          notes.push(note);
        }
      }
      return notes.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    } catch (error) {
      console.error("Error getting all notes:", error);
      return [];
    }
  }
  /**
   * 获取所有笔记的元数据（不包含内容）
   * @returns 笔记元数据数组
   */
  async getNotesMetadata() {
    try {
      const notes = await this.getAllNotes();
      return notes.map((note) => ({
        id: note.id,
        title: note.title,
        category: note.category,
        tags: note.tags,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt
      }));
    } catch (error) {
      console.error("Error getting notes metadata:", error);
      return [];
    }
  }
  /**
   * 更新笔记
   * @param id 笔记 ID
   * @param updates 要更新的字段
   * @returns 更新后的笔记对象，如果笔记不存在则返回 null
   */
  async updateNote(id, updates) {
    const note = await this.getNote(id);
    if (!note) return null;
    const updatedNote = {
      ...note,
      ...updates,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    await this.saveNote(updatedNote);
    return updatedNote;
  }
  /**
   * 删除笔记
   * @param id 笔记 ID
   */
  async deleteNote(id) {
    await FileService$1.deleteFile(`notes/${id}.md`);
  }
  /**
   * 解析笔记内容
   * 从 frontmatter 格式的文件中提取元数据和内容
   * @param id 笔记 ID
   * @param content 文件内容
   * @returns 解析后的笔记对象
   */
  parseNote(id, content) {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);
    if (match) {
      const frontmatter = match[1];
      const markdown = match[2];
      const parseFrontmatter = (text) => {
        const lines = text.split("\n");
        const data2 = {};
        for (const line of lines) {
          const [key, ...valueParts] = line.split(":");
          if (key && valueParts.length > 0) {
            const value = valueParts.join(":").trim();
            if (key === "tags") {
              try {
                data2[key] = JSON.parse(value);
              } catch {
                data2[key] = [];
              }
            } else {
              data2[key] = value;
            }
          }
        }
        return data2;
      };
      const data = parseFrontmatter(frontmatter);
      return {
        id,
        title: data.title || "Untitled",
        content: markdown,
        // 在实际应用中，应将 markdown 转换为 HTML
        markdown: markdown.trim(),
        category: data.category || "Uncategorized",
        tags: data.tags || [],
        createdAt: data.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: data.updatedAt || (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    return {
      id,
      title: "Untitled",
      content,
      markdown: content,
      category: "Uncategorized",
      tags: [],
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  /**
   * 搜索笔记
   * 在标题、内容和标签中搜索关键词
   * @param query 搜索关键词
   * @returns 匹配的笔记数组
   */
  async searchNotes(query) {
    const notes = await this.getAllNotes();
    const lowerQuery = query.toLowerCase();
    return notes.filter(
      (note) => note.title.toLowerCase().includes(lowerQuery) || note.markdown.toLowerCase().includes(lowerQuery) || note.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  }
}
const NoteService$1 = new NoteService();
class GitService {
  repoDir;
  initialized = false;
  constructor() {
    this.repoDir = FileService$1.getUserDataPath();
  }
  /**
   * 确保 Git 仓库已初始化
   * 如果仓库不存在则创建新仓库
   */
  async ensureInitialized() {
    if (this.initialized) return;
    try {
      try {
        const gitRoot = await git__namespace.findRoot({ fs: fs__namespace, filepath: this.repoDir });
        console.log("Git repository already exists at:", gitRoot);
      } catch (e) {
        await git__namespace.init({
          fs: fs__namespace,
          dir: this.repoDir,
          defaultBranch: "main"
        });
        const gitignorePath = `${this.repoDir}/.gitignore`;
        if (!fs__namespace.existsSync(gitignorePath)) {
          await fs__namespace.promises.writeFile(gitignorePath, "*.log\nnode_modules/\n.DS_Store\n");
        }
        await git__namespace.add({
          fs: fs__namespace,
          dir: this.repoDir,
          filepath: ".gitignore"
        });
        await git__namespace.commit({
          fs: fs__namespace,
          dir: this.repoDir,
          message: "Initial commit",
          author: {
            name: "G-Note",
            email: "g-note@localhost"
          }
        });
        console.log("Git repository initialized with initial commit");
      }
      this.initialized = true;
    } catch (error) {
      console.error("Error initializing git repo:", error);
    }
  }
  /**
   * 自动提交笔记更改
   * @param noteId 笔记 ID
   * @param message 提交消息，可选
   * @returns 提交的哈希值，失败返回 null
   */
  async autoCommit(noteId, message) {
    try {
      await this.ensureInitialized();
      const filePath = `notes/${noteId}.md`;
      try {
        await fs__namespace.promises.access(`${this.repoDir}/${filePath}`);
      } catch (e) {
        console.error("Note file does not exist:", filePath);
        return null;
      }
      const timestamp = (/* @__PURE__ */ new Date()).toISOString();
      const commitMessage = message || `Auto-save note ${noteId} at ${timestamp}`;
      await git__namespace.add({
        fs: fs__namespace,
        dir: this.repoDir,
        filepath: filePath
      });
      const commitHash = await git__namespace.commit({
        fs: fs__namespace,
        dir: this.repoDir,
        message: commitMessage,
        author: {
          name: "G-Note",
          email: "g-note@localhost"
        }
      });
      console.log("Auto-commit successful:", commitHash);
      return commitHash;
    } catch (error) {
      console.error("Error auto-committing:", error);
      return null;
    }
  }
  /**
   * 获取笔记的提交历史
   * @param noteId 笔记 ID
   * @param limit 返回的历史记录数量限制
   * @returns 提交历史数组
   */
  async getHistory(noteId, limit = 20) {
    try {
      await this.ensureInitialized();
      try {
        await git__namespace.resolveRef({ fs: fs__namespace, dir: this.repoDir, ref: "HEAD" });
      } catch (e) {
        return [];
      }
      const log = await git__namespace.log({
        fs: fs__namespace,
        dir: this.repoDir,
        filepath: `notes/${noteId}.md`,
        depth: limit
      });
      return log.map((commit) => ({
        hash: commit.oid,
        message: commit.commit.message.split("\n")[0],
        author: commit.commit.author.name || "G-Note",
        timestamp: commit.commit.author.timestamp || Date.now() / 1e3,
        noteId
      }));
    } catch (error) {
      console.error("Error getting history:", error);
      return [];
    }
  }
  /**
   * 检出指定版本的笔记内容
   * @param noteId 笔记 ID
   * @param commitHash 提交哈希值
   * @returns 检出后的内容，失败返回 null
   */
  async checkoutVersion(noteId, commitHash) {
    try {
      await this.ensureInitialized();
      const blob = await git__namespace.readBlob({
        fs: fs__namespace,
        dir: this.repoDir,
        oid: commitHash,
        filepath: `notes/${noteId}.md`
      });
      const contentStr = Buffer.from(blob.blob).toString("utf-8");
      await FileService$1.writeFile(`notes/${noteId}.md`, contentStr);
      console.log("Checked out version:", commitHash);
      return contentStr;
    } catch (error) {
      console.error("Error checking out version:", error);
      return null;
    }
  }
  /**
   * 获取两个提交之间的差异
   * @param noteId 笔记 ID
   * @param commitHash1 第一个提交哈希值
   * @param commitHash2 第二个提交哈希值
   * @returns 包含新旧内容的对象
   */
  async getDiff(noteId, commitHash1, commitHash2) {
    try {
      await this.ensureInitialized();
      const blob1 = await git__namespace.readBlob({
        fs: fs__namespace,
        dir: this.repoDir,
        oid: commitHash1,
        filepath: `notes/${noteId}.md`
      });
      const blob2 = await git__namespace.readBlob({
        fs: fs__namespace,
        dir: this.repoDir,
        oid: commitHash2,
        filepath: `notes/${noteId}.md`
      });
      return {
        oldContent: Buffer.from(blob1.blob).toString("utf-8"),
        newContent: Buffer.from(blob2.blob).toString("utf-8")
      };
    } catch (error) {
      console.error("Error getting diff:", error);
      return null;
    }
  }
  /**
   * 推送到远程仓库
   * @param remoteUrl 远程仓库 URL
   * @param token 访问令牌
   * @param branch 分支名称，默认为 main
   * @returns 是否成功
   */
  async push(remoteUrl, token, branch = "main") {
    try {
      await this.ensureInitialized();
      const remotes = await git__namespace.listRemotes({ fs: fs__namespace, dir: this.repoDir });
      const hasOrigin = remotes.some((r) => r.remote === "origin");
      if (!hasOrigin) {
        await git__namespace.addRemote({
          fs: fs__namespace,
          dir: this.repoDir,
          remote: "origin",
          url: remoteUrl
        });
      }
      await git__namespace.push({
        fs: fs__namespace,
        http: require("isomorphic-git/http/node"),
        dir: this.repoDir,
        remote: "origin",
        ref: `refs/heads/${branch}`,
        onAuth: () => ({ username: token, password: "" })
      });
      console.log("Push successful");
      return true;
    } catch (error) {
      console.error("Error pushing:", error);
      return false;
    }
  }
  /**
   * 从远程仓库拉取
   * @param remoteUrl 远程仓库 URL
   * @param token 访问令牌
   * @param branch 分支名称，默认为 main
   * @returns 是否成功
   */
  async pull(remoteUrl, token, branch = "main") {
    try {
      await this.ensureInitialized();
      const remotes = await git__namespace.listRemotes({ fs: fs__namespace, dir: this.repoDir });
      const hasOrigin = remotes.some((r) => r.remote === "origin");
      if (!hasOrigin) {
        await git__namespace.addRemote({
          fs: fs__namespace,
          dir: this.repoDir,
          remote: "origin",
          url: remoteUrl
        });
      }
      await git__namespace.pull({
        fs: fs__namespace,
        http: require("isomorphic-git/http/node"),
        dir: this.repoDir,
        remote: "origin",
        ref: `refs/heads/${branch}`,
        onAuth: () => ({ username: token, password: "" }),
        singleBranch: true
      });
      console.log("Pull successful");
      return true;
    } catch (error) {
      console.error("Error pulling:", error);
      return false;
    }
  }
  /**
   * 创建快照（使用 Git 标签）
   * @param name 快照名称
   * @returns 标签名称，失败返回 null
   */
  async createSnapshot(name) {
    try {
      await this.ensureInitialized();
      const tagName = name.includes("snapshot-") ? name : `snapshot-${name}-${Date.now()}`;
      await git__namespace.tag({
        fs: fs__namespace,
        dir: this.repoDir,
        ref: tagName,
        object: "HEAD"
      });
      console.log("Snapshot created:", tagName);
      return tagName;
    } catch (error) {
      console.error("Error creating snapshot:", error);
      return null;
    }
  }
  /**
   * 获取所有快照列表
   * @returns 快照数组，包含名称和哈希值
   */
  async getSnapshots() {
    try {
      await this.ensureInitialized();
      const tags = await git__namespace.listTags({ fs: fs__namespace, dir: this.repoDir });
      const snapshots = [];
      for (const tag of tags) {
        if (tag.startsWith("snapshot-")) {
          const ref = await git__namespace.resolveRef({ fs: fs__namespace, dir: this.repoDir, ref: tag });
          snapshots.push({ name: tag, hash: ref });
        }
      }
      return snapshots;
    } catch (error) {
      console.error("Error getting snapshots:", error);
      return [];
    }
  }
}
const GitService$1 = new GitService();
class SearchService {
  index;
  indexedNotes = /* @__PURE__ */ new Set();
  constructor() {
    this.index = new FlexSearch.Document({
      document: {
        id: "id",
        index: ["title", "content", "tags"],
        store: true
      },
      tokenize: "full"
    });
    this.buildIndex();
  }
  /**
   * 构建搜索索引
   * 从所有现有笔记构建初始索引
   */
  async buildIndex() {
    try {
      const notes = await NoteService$1.getAllNotes();
      for (const note of notes) {
        await this.indexNote(note);
      }
      console.log("Search index built with", notes.length, "notes");
    } catch (error) {
      console.error("Error building search index:", error);
    }
  }
  /**
   * 将笔记添加到搜索索引
   * @param note 要索引的笔记
   */
  async indexNote(note) {
    try {
      if (!this.indexedNotes.has(note.id)) {
        await this.index.add({
          id: note.id,
          title: note.title,
          content: note.markdown,
          tags: note.tags.join(" ")
        });
        this.indexedNotes.add(note.id);
      }
    } catch (error) {
      console.error("Error indexing note:", error);
    }
  }
  /**
   * 更新笔记的搜索索引
   * @param note 要更新的笔记
   */
  async updateNoteIndex(note) {
    try {
      await this.index.update({
        id: note.id,
        title: note.title,
        content: note.markdown,
        tags: note.tags.join(" ")
      });
    } catch (error) {
      console.error("Error updating note index:", error);
    }
  }
  /**
   * 从搜索索引中移除笔记
   * @param noteId 笔记 ID
   */
  async removeFromIndex(noteId) {
    try {
      await this.index.remove(noteId);
      this.indexedNotes.delete(noteId);
    } catch (error) {
      console.error("Error removing from index:", error);
    }
  }
  /**
   * 搜索笔记
   * @param query 搜索关键词
   * @returns 匹配的笔记数组
   */
  async search(query) {
    try {
      if (!query || query.trim().length === 0) {
        return await NoteService$1.getAllNotes();
      }
      const results = await this.index.search(query, {
        limit: 50,
        enrich: true
      });
      const noteIds = /* @__PURE__ */ new Set();
      const uniqueResults = [];
      for (const result of results) {
        for (const field of result.result) {
          noteIds.add(field.id);
        }
      }
      for (const id of noteIds) {
        const note = await NoteService$1.getNote(id);
        if (note) {
          uniqueResults.push(note);
        }
      }
      return uniqueResults;
    } catch (error) {
      console.error("Error searching:", error);
      return [];
    }
  }
  /**
   * 搜索笔记并高亮显示匹配内容
   * @param query 搜索关键词
   * @returns 包含笔记和匹配内容的数组
   */
  async searchWithHighlight(query) {
    try {
      const notes = await this.search(query);
      const lowerQuery = query.toLowerCase();
      return notes.map((note) => {
        const matches = [];
        if (note.title.toLowerCase().includes(lowerQuery)) {
          matches.push(note.title);
        }
        const lines = note.markdown.split("\n");
        for (const line of lines) {
          if (line.toLowerCase().includes(lowerQuery)) {
            matches.push(line.trim());
          }
        }
        return { note, matches: matches.slice(0, 5) };
      });
    } catch (error) {
      console.error("Error searching with highlight:", error);
      return [];
    }
  }
}
const SearchService$1 = new SearchService();
const registerNoteHandlers = () => {
  electron.ipcMain.handle("notes:list", async () => {
    try {
      const notes = await NoteService$1.getAllNotes();
      return { success: true, data: notes };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("notes:get", async (_event, id) => {
    try {
      const note = await NoteService$1.getNote(id);
      if (!note) {
        return { success: false, error: "Note not found" };
      }
      return { success: true, data: note };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("notes:create", async (_event, title) => {
    try {
      const note = await NoteService$1.createNote(title);
      await GitService$1.autoCommit(note.id, `Create note: ${note.title}`);
      await SearchService$1.indexNote(note);
      return { success: true, data: note };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("notes:update", async (_event, id, updates) => {
    try {
      const note = await NoteService$1.updateNote(id, updates);
      if (!note) {
        return { success: false, error: "Note not found" };
      }
      await GitService$1.autoCommit(id, `Update note: ${note.title}`);
      await SearchService$1.updateNoteIndex(note);
      return { success: true, data: note };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("notes:delete", async (_event, id) => {
    try {
      await NoteService$1.deleteNote(id);
      await GitService$1.autoCommit(id, `Delete note: ${id}`);
      await SearchService$1.removeFromIndex(id);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("notes:metadata", async () => {
    try {
      const metadata = await NoteService$1.getNotesMetadata();
      return { success: true, data: metadata };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
};
const registerGitHandlers = () => {
  electron.ipcMain.handle("git:history", async (_event, noteId, limit = 20) => {
    try {
      const history = await GitService$1.getHistory(noteId, limit);
      return { success: true, data: history };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("git:commit", async (_event, noteId, message) => {
    try {
      const commitHash = await GitService$1.autoCommit(noteId, message);
      if (!commitHash) {
        return { success: false, error: "Commit failed" };
      }
      return { success: true, data: { hash: commitHash } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("git:checkout", async (_event, noteId, commitHash) => {
    try {
      const content = await GitService$1.checkoutVersion(noteId, commitHash);
      if (!content) {
        return { success: false, error: "Checkout failed" };
      }
      await GitService$1.autoCommit(noteId, `Restore note ${noteId} to version ${commitHash}`);
      return { success: true, data: { content } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("git:diff", async (_event, noteId, hash1, hash2) => {
    try {
      const diff = await GitService$1.getDiff(noteId, hash1, hash2);
      if (!diff) {
        return { success: false, error: "Failed to get diff" };
      }
      return { success: true, data: diff };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("git:push", async (_event, remoteUrl, token, branch) => {
    try {
      const success = await GitService$1.push(remoteUrl, token, branch);
      return { success };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("git:pull", async (_event, remoteUrl, token, branch) => {
    try {
      const success = await GitService$1.pull(remoteUrl, token, branch);
      return { success };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("git:snapshot", async (_event, name) => {
    try {
      const tagName = await GitService$1.createSnapshot(name);
      if (!tagName) {
        return { success: false, error: "Failed to create snapshot" };
      }
      return { success: true, data: { tagName } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("git:snapshots", async () => {
    try {
      const snapshots = await GitService$1.getSnapshots();
      return { success: true, data: snapshots };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
};
const registerFsHandlers = () => {
  electron.ipcMain.handle("fs:save-asset", async (_event, fileName, buffer) => {
    try {
      const data = Buffer.from(buffer);
      const url = await FileService$1.saveAsset(fileName, data);
      return { success: true, data: { url } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("fs:get-asset-path", async (_event, fileName) => {
    try {
      const path2 = FileService$1.getAssetPath(fileName);
      return { success: true, data: { path: path2 } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("fs:select-file", async () => {
    try {
      const result = await electron.dialog.showOpenDialog({
        properties: ["openFile"],
        filters: [
          { name: "Images", extensions: ["jpg", "jpeg", "png", "gif"] },
          { name: "All Files", extensions: ["*"] }
        ]
      });
      if (result.canceled) {
        return { success: false, error: "Dialog cancelled" };
      }
      return { success: true, data: { filePath: result.filePaths[0] } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("fs:save-file-dialog", async (_event, defaultName) => {
    try {
      const result = await electron.dialog.showSaveDialog({
        defaultPath: defaultName,
        filters: [
          { name: "PDF", extensions: ["pdf"] },
          { name: "HTML", extensions: ["html"] },
          { name: "Markdown", extensions: ["md"] },
          { name: "All Files", extensions: ["*"] }
        ]
      });
      if (result.canceled) {
        return { success: false, error: "Dialog cancelled" };
      }
      return { success: true, data: { filePath: result.filePath } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("fs:read-file", async (_event, filePath) => {
    try {
      const content = await FileService$1.readFile(filePath);
      return { success: true, data: { content } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("fs:write-file", async (_event, filePath, content) => {
    try {
      await FileService$1.writeFile(filePath, content);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("fs:exists", async (_event, filePath) => {
    try {
      const exists = await FileService$1.fileExists(filePath);
      return { success: true, data: { exists } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("fs:get-user-data-path", async () => {
    try {
      const path2 = FileService$1.getUserDataPath();
      return { success: true, data: { path: path2 } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
};
const registerSearchHandlers = () => {
  electron.ipcMain.handle("search:query", async (_event, query) => {
    try {
      const results = await SearchService$1.search(query);
      return { success: true, data: results };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("search:query-highlight", async (_event, query) => {
    try {
      const results = await SearchService$1.searchWithHighlight(query);
      return { success: true, data: results };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("search:rebuild-index", async () => {
    try {
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
};
class ExportService {
  /**
   * 导出笔记为 PDF
   * @param noteId 笔记 ID
   * @returns PDF 文件的 Buffer
   */
  async exportToPDF(noteId) {
    return new Promise(async (resolve, reject) => {
      try {
        const note = await NoteService$1.getNote(noteId);
        if (!note) {
          reject(new Error("Note not found"));
          return;
        }
        const win2 = new electron.BrowserWindow({
          show: false,
          webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
          }
        });
        const html = this.generateHTML(note);
        win2.webContents.on("did-finish-load", async () => {
          try {
            const pdfBuffer = await win2.webContents.printToPDF({
              pageSize: "A4",
              printBackground: true,
              marginsType: 0
            });
            win2.close();
            resolve(pdfBuffer);
          } catch (error) {
            win2.close();
            reject(error);
          }
        });
        win2.webContents.on("did-fail-load", () => {
          win2.close();
          reject(new Error("Failed to load content"));
        });
        win2.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
      } catch (error) {
        reject(error);
      }
    });
  }
  /**
   * 导出笔记为 HTML
   * @param noteId 笔记 ID
   * @returns HTML 字符串
   */
  async exportToHTML(noteId) {
    const note = await NoteService$1.getNote(noteId);
    if (!note) {
      throw new Error("Note not found");
    }
    return this.generateHTML(note);
  }
  /**
   * 导出笔记为 Markdown
   * @param noteId 笔记 ID
   * @returns Markdown 字符串
   */
  async exportToMarkdown(noteId) {
    const note = await NoteService$1.getNote(noteId);
    if (!note) {
      throw new Error("Note not found");
    }
    return note.markdown;
  }
  /**
   * 批量导出笔记为 PDF
   * @param noteIds 笔记 ID 数组
   * @returns PDF 文件的 Buffer 数组
   */
  async batchExportToPDF(noteIds) {
    const pdfs = [];
    for (const id of noteIds) {
      try {
        const pdf = await this.exportToPDF(id);
        pdfs.push(pdf);
      } catch (error) {
        console.error(`Error exporting note ${id} to PDF:`, error);
      }
    }
    return pdfs;
  }
  /**
   * 生成笔记的 HTML 表示
   * @param note 笔记对象
   * @returns HTML 字符串
   */
  generateHTML(note) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.escapeHtml(note.title)}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 40px auto;
            padding: 20px;
            background: white;
            color: #333;
        }
        h1 {
            border-bottom: 2px solid #eee;
            padding-bottom: 10px;
        }
        .meta {
            color: #666;
            font-size: 0.9em;
            margin-bottom: 20px;
        }
        .tag {
            display: inline-block;
            background: #e1f5fe;
            padding: 2px 8px;
            border-radius: 3px;
            margin-right: 5px;
            font-size: 0.85em;
        }
        pre {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
        }
        code {
            font-family: 'Courier New', monospace;
            background: #f5f5f5;
            padding: 2px 5px;
            border-radius: 3px;
        }
        pre code {
            background: none;
            padding: 0;
        }
        blockquote {
            border-left: 4px solid #ddd;
            padding-left: 20px;
            margin-left: 0;
            color: #666;
        }
        img {
            max-width: 100%;
            height: auto;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 20px 0;
        }
        table th,
        table td {
            border: 1px solid #ddd;
            padding: 8px;
        }
        table th {
            background: #f5f5f5;
        }
    </style>
</head>
<body>
    <h1>${this.escapeHtml(note.title)}</h1>
    <div class="meta">
        <p><strong>Category:</strong> ${this.escapeHtml(note.category)}</p>
        <p><strong>Created:</strong> ${new Date(note.createdAt).toLocaleString()}</p>
        <p><strong>Modified:</strong> ${new Date(note.updatedAt).toLocaleString()}</p>
        ${note.tags.length > 0 ? "<p><strong>Tags:</strong> " + note.tags.map((tag) => `<span class="tag">${this.escapeHtml(tag)}</span>`).join("") + "</p>" : ""}
    </div>
    <hr>
    <div class="content">
        ${this.markdownToHTML(note.markdown)}
    </div>
</body>
</html>
    `;
  }
  /**
   * 转义 HTML 特殊字符
   * @param text 要转义的文本
   * @returns 转义后的文本
   */
  escapeHtml(text) {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }
  /**
   * 将 Markdown 转换为 HTML
   * 简单的转换实现，生产环境建议使用 marked 或 markdown-it 等库
   * @param markdown Markdown 文本
   * @returns HTML 字符串
   */
  markdownToHTML(markdown) {
    let html = markdown;
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, "<pre><code>$2</code></pre>");
    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
    html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>");
    html = html.replace(/^## (.*$)/gim, "<h2>$1</h2>");
    html = html.replace(/^# (.*$)/gim, "<h1>$1</h1>");
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
    html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2">$1</a>');
    html = html.replace(/!\[([^\]]*)\]\(([^\)]+)\)/g, '<img src="$2" alt="$1">');
    html = html.replace(/^> (.*$)/gim, "<blockquote>$1</blockquote>");
    html = html.replace(/^\* (.*$)/gim, "<li>$1</li>");
    html = html.replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>");
    html = html.replace(/^\d+\. (.*$)/gim, "<li>$1</li>");
    html = html.replace(/\n\n/g, "</p><p>");
    html = "<p>" + html + "</p>";
    html = html.replace(/<p><\/p>/g, "");
    html = html.replace(/<p>(<h[1-6]>)/g, "$1");
    html = html.replace(/(<\/h[1-6]>)<\/p>/g, "$1");
    html = html.replace(/<p>(<pre>)/g, "$1");
    html = html.replace(/(<\/pre>)<\/p>/g, "$1");
    html = html.replace(/<p>(<blockquote>)/g, "$1");
    html = html.replace(/(<\/blockquote>)<\/p>/g, "$1");
    html = html.replace(/<p>(<ul>)/g, "$1");
    html = html.replace(/(<\/ul>)<\/p>/g, "$1");
    return html;
  }
}
const ExportService$1 = new ExportService();
const registerExportHandlers = () => {
  electron.ipcMain.handle("export:pdf", async (_event, noteId) => {
    try {
      const pdf = await ExportService$1.exportToPDF(noteId);
      return { success: true, data: { pdf } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("export:html", async (_event, noteId) => {
    try {
      const html = await ExportService$1.exportToHTML(noteId);
      return { success: true, data: { html } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("export:markdown", async (_event, noteId) => {
    try {
      const markdown = await ExportService$1.exportToMarkdown(noteId);
      return { success: true, data: { markdown } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("export:batch-pdf", async (_event, noteIds) => {
    try {
      const pdfs = await ExportService$1.batchExportToPDF(noteIds);
      return { success: true, data: { pdfs } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
};
function registerIPCHandlers() {
  registerNoteHandlers();
  registerGitHandlers();
  registerFsHandlers();
  registerSearchHandlers();
  registerExportHandlers();
  console.log("All IPC handlers registered");
}
let win = null;
const createWindow = () => {
  win = new electron.BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    }
  });
  win.on("ready-to-show", () => {
    win?.show();
  });
  const isDev = process.env.NODE_ENV === "development" || !electron.app.isPackaged;
  if (isDev) {
    const devServerUrl = process.env.VITE_DEV_SERVER_URL || "http://localhost:5173";
    console.log("Loading dev server from:", devServerUrl);
    win.loadURL(devServerUrl);
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
};
electron.app.whenReady().then(() => {
  registerIPCHandlers();
  createWindow();
  electron.app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
