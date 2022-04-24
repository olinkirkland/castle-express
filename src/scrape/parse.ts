import fs from 'fs';
import * as jsdom from 'jsdom';
import path from 'path';
import ProgressBar from 'progress';
import Castle from '../interfaces/castle';
import { exit } from '../utils/ask';
import { ensureDirectoryExistence, htmlDir, jsonDir } from '../utils/file';

const sectionNames: string[] = [
  'history',
  'properties',
  'physical',
  'tourism',
  'references'
];

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
      castle.id = id;
      castle[sectionNames[section]] = data;
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
  const history = new jsdom.JSDOM(u.history).window.document;
  const properties = new jsdom.JSDOM(u.properties).window.document;
  const physical = new jsdom.JSDOM(u.physical).window.document;
  const tourism = new jsdom.JSDOM(u.tourism).window.document;
  const references = new jsdom.JSDOM(u.references).window.document;

  let castle: Castle = {};

  // Id & Urls
  console.log('\nID: ', u.id);
  castle.id = makeId(u.id);
  castle.urls = makeUrls(u.id);

  // Name
  const nameSuffixAndSlug = makeName(history);
  castle.name = nameSuffixAndSlug.name;
  castle.nameSuffix = nameSuffixAndSlug.suffix;
  castle.slug = nameSuffixAndSlug.slug;
  // castle.location = makeLocation();
  // castle.condition = makeCondition();
  // castle.classifications  = makeClassifications();
  // castle.structures = makeStructures();
  // castle.purpose = makePurpose();
  // castle.gallery = makeGallery();
  // castle.dates = makeDates();

  return castle;
}

function makeId(id: string): string {
  return id;
}

function makeUrls(id: string) {
  let urls = {
    history: null,
    properties: null,
    physical: null,
    tourism: null,
    references: null
  };
  const sectionQueries = ['', 'm=h&', 'm=o&', 'm=g&', 'm=n&'];
  sectionQueries.forEach((str, i) => {
    urls[
      sectionNames[i]
    ] = `https://www.ebidat.de/cgi-bin/ebidat.pl?${str}id=${id}`;
  });

  return urls;
}

function makeName(history) {
  let nameEl = history.querySelector('h2');

  console.log(nameEl);

  let name: string = nameEl.textContent;
  let suffix: string = '';
  let slug: string = '';

  return { name: name, suffix: suffix, slug: slug };
}
