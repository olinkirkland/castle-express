import fs from 'fs';
import https from 'https';
import path from 'path';
import ProgressBar from 'progress';
import { askNumber, askYesOrNo, exit } from '../utils/ask';
import { ensureDirectoryExistence as ensureDirectoryExists } from '../utils/file';
import { parse } from './parse';

askNumber('Download from index', (indexBegin) => {
  askNumber('Download to index', (indexEnd) => {
    downloadEntries(indexBegin, indexEnd);
  });
});

function downloadEntries(indexBegin, indexEnd) {
  // Download new data from EBIDAT and store them in data/html
  const sectionQueries = ['', 'm=h&', 'm=o&', 'm=g&', 'm=n&'];

  const entryCount: number = 1 + indexEnd - indexBegin;
  let queue = [];
  for (let i = indexBegin; i <= indexEnd; i++) {
    for (let j = 1; j <= 4; j++)
      queue.push({
        id: i,
        section: j,
        url: `https://www.ebidat.de/cgi-bin/ebidat.pl?${sectionQueries[j]}id=${i}`
      });
  }

  console.log(
    `Downloading entries from ${indexBegin} to ${indexEnd} (${entryCount} entries; ${queue.length} files)`
  );

  let bar = new ProgressBar(`[:bar] :current/:total | :percent`, {
    complete: '=',
    incomplete: ' ',
    width: 20,
    total: queue.length
  });

  downloadFromQueue();
  function downloadFromQueue() {
    if (queue.length === 0) {
      onEntryDownloadComplete();
      return;
    }

    const current = queue.shift();

    let filePath: string = path.join(
      __dirname,
      '..',
      '..',
      'data',
      'html',
      `${current.id}`,
      `${current.id}-${current.section}.html`
    );
    ensureDirectoryExists(filePath);

    // Does the file already exist?
    bar.tick();
    if (fs.existsSync(filePath)) {
      downloadFromQueue();
      return;
    }

    const file = fs.createWriteStream(filePath);
    https.get(current.url, (res) => {
      res.setEncoding('binary');
      res.pipe(file);
      downloadFromQueue();
      return;
    });
  }
}

function onEntryDownloadComplete() {
  console.log('Downloads complete!');
  askYesOrNo('Parse downloaded files', parse, exit);
}
