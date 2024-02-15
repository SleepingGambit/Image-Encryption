const meow = require('meow');
const meowHelp = require('cli-meow-help');

const flags = {
    encrypt: {
        type: `string`,
        desc: `The image to encrypt`,
        alias: `e`
    },
    decrypt: {
        type: `string`,
        desc: `The image to decrypt`,
        alias: `d`
    },
    outputImageFileName: {
        type: `string`,
        desc: `The output image file name`,
        alias: `i`
    },
    outputKeyFileName: {
        type: `string`,
        desc: `The output key file name`,
        alias: `p`
    },
    key: {
        type: `string`,
        desc: `The key file to use for decryption`,
        alias: `k`
    },
    clear: {
        type: `boolean`,
        default: false,
        alias: `c`,
        desc: `Clear the console`
    },
    noClear: {
        type: `boolean`,
        default: false,
        desc: `Don't clear the console`
    },
    version: {
        type: `boolean`,
        alias: `v`,
        desc: `Print CLI version`
    }
};

const helpText = meowHelp({
    name: `imcrypt`,
    flags
});

const options = {
    inferType: true,
    description: true, // Enable printing descriptions in help output
    hardRejection: false,
    flags
};

const cli = meow(helpText, options);

module.exports = cli;
