import fs from 'fs';
import * as jsdom from 'jsdom';
import path from 'path';
import ProgressBar from 'progress';
import Castle from '../interfaces/castle';
import { exit } from '../utils/ask';
import { ensureDirectoryExistence, htmlDir, jsonDir } from '../utils/file';

module.exports = { parse };
export function parse() {
  // Parse the downloaded HTML files and store them in data/json
  const dirs: string[] = fs.readdirSync(htmlDir);

  console.log(`Parsing ${dirs.length} files`);
  const bar = new ProgressBar(`[:bar] :current/:total | :percent`, {
    complete: '=',
    incomplete: ' ',
    width: 20,
    total: dirs.length
  });

  let castle: Castle = {};

  dirs.forEach((dir) => {
    bar.tick();

    const files = fs.readdirSync(path.join(htmlDir, dir));
    const id = dir;

    files.forEach((file) => {
      file = path.join(htmlDir, dir, file);
      const data = fs.readFileSync(file, 'utf8');

      const section = parseInt(file.split('-')[1].split('.')[0]);
      castle.id = `ebidat-${id}`;
      castle[
        ['history', 'properties', 'physical', 'tourism', 'references'][section]
      ] = data;
    });

    castle = parseCastle(castle);

    try {
      let filePath = path.join(jsonDir, `${castle.id}.json`);
      ensureDirectoryExistence(filePath);
      fs.writeFileSync(filePath, JSON.stringify(castle, null, 2));
    } catch (err) {
      console.error(err);
    }
  });

  console.log('Parse complete');
  exit();
}

function parseCastle(u) {
  const history = new jsdom.JSDOM(u.history);
  const properties = new jsdom.JSDOM(u.properties);
  const physical = new jsdom.JSDOM(u.physical);
  const tourism = new jsdom.JSDOM(u.tourism);
  const references = new jsdom.JSDOM(u.references);

  let castle: Castle = {};
  castle.id = u.id;

  return castle;
}
