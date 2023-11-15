import { fileURLToPath } from 'url';
import path from 'path';

export function getDirAndFileName(importMeta: ImportMeta) {
    const __filename = fileURLToPath(importMeta.url);
    const __dirname = path.dirname(__filename);
    return { __filename, __dirname }
}

export function getBasePath() {
    return window.basePath;
}