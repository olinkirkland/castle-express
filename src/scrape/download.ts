import { askNumber, askYesOrNo } from '../utils/ask';

function askDownload() {
  askYesOrNo(
    'Download new entries',
    () => {
      askNumber('Index to begin with', (index) => {
        askNumber('How many entries', (count) => {
          console.log(`[${index} - ${index + count}]`);
        });
      });
    },
    () => {}
  );
}
