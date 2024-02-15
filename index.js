const init = require('./init');
const cli = require('./clis');
const encrypt = require('./encrypt');
const decrypt = require('./decrypt');

const { input, flags } = cli;
const { clear } = flags;

(async () => {
  try {
    init({ clear });

    if (input.includes('help')) {
      cli.showHelp(0);
    } else if (flags.encrypt) {
      await encrypt(flags);
    } else if (flags.decrypt) {
      await decrypt(flags);
    }

    const chalk = (await import('chalk')).default;
    console.log(
      chalk.bgMagenta(' Give it a star on github: ') +
        chalk.bold(' https://github.com/theninza/imcrypt ')
    );
  } catch (error) {
    console.error('An error occurred:', error.message);
    process.exit(1);
  }
})();
