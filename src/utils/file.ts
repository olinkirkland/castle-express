import path from 'path';
import fs from 'fs';

export const htmlDir = path.join(__dirname, '..', '..', 'data', 'html');
export const jsonDir = path.join(__dirname, '..', '..', 'data', 'json');

export function ensureDirectoryExistence(filePath) {
  let dir = path.dirname(filePath);
  if (fs.existsSync(dir)) {
    return true;
  }
  ensureDirectoryExistence(dir);
  fs.mkdirSync(dir);
}
