import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Ask the user for either yes or no
export function askYesOrNo(
  prompt: string,
  onYes: () => void,
  onNo: () => void
) {
  rl.question(`${prompt} (y/n)? `, (str) => {
    if (str === 'y') {
      onYes();
    } else if (str === 'n') {
      onNo();
    } else {
      console.log(`'${str}' is not valid input\n`);
      askYesOrNo(prompt, onYes, onNo);
    }
  });
}

// Ask the user for a number
export function askNumber(prompt: string, onNumber: (n: number) => void) {
  rl.question(`${prompt} (Number) `, (str) => {
    const n = Number.parseInt(str);
    if (!Number.isInteger(n)) {
      console.log(`'${str}' is not a valid integer\n`);
      askNumber(prompt, onNumber);
    } else {
      onNumber(n);
    }
  });
}
