const alert = require('cli-alerts');
const fs = require('fs');
const jimp = require('jimp');
const path = require('path');

const decrypt = async (flags) => {
    try {
        if (flags.encrypt) {
            alert({
                type: 'warning',
                name: 'Invalid combination of flags',
                msg: 'Cannot use both --encrypt and --decrypt flags together'
            });
            process.exit(1);
        }

        const filePath = flags.decrypt;

        if (!filePath || !fs.existsSync(filePath)) {
            alert({
                type: 'warning',
                name: 'Invalid file path',
                msg: 'Please provide a valid file path'
            });
            process.exit(1);
        }

        if (!flags.key) {
            alert({
                type: 'warning',
                name: 'Invalid key',
                msg: 'Please provide a valid key with --key / -k'
            });
            process.exit(1);
        }

        const image = await jimp.read(filePath);

        const extension = image.getExtension();
        const rgba = image.bitmap.data;
        const length = rgba.length;

        const keyPath = flags.key;

        if (!fs.existsSync(keyPath)) {
            // Display an error message if the key file path is invalid
            alert({
                type: 'error',
                name: 'Invalid key path',
                msg: 'Please provide a valid key path with --key / -k'
            });
            process.exit(1);
        }

        const key = fs.readFileSync(keyPath, 'utf8');
        const keyDecoded = Buffer.from(key, 'base64');

        const keyArray = Array.from(keyDecoded);

        if (keyArray.length !== length) {
            alert({
                type: 'error',
                name: 'Invalid key',
                msg: 'The key is not valid'
            });
            process.exit(1);
        }

        for (let i = 0; i < length; i++) {
            rgba[i] = rgba[i] ^ keyArray[i];
        }

        image.bitmap.data = rgba;

        const fileName = path.basename(filePath).replace(/_encrypted\.png$/, '');

        const fileNameWithoutExtension = flags.outputImageFileName || `${fileName}_decrypted`;
        
        if (fs.existsSync(`${fileNameWithoutExtension}.${extension}`)) {
            alert({
                type: 'error',
                name: 'Output file already exists',
                msg: `Output image file already exists: ${fileNameWithoutExtension}.${extension}`
            });
            process.exit(1);
        }

        image.write(`${fileNameWithoutExtension}.${extension}`);

        alert({
            type: 'success',
            name: 'Success',
            msg: `Image decrypted successfully\nDecrypted Image: ${fileNameWithoutExtension}.${extension}`
        });
    } catch (err) {
        alert({
            type: 'error',
            name: 'Error',
            msg: `${err}`
        });
    }
};

module.exports = decrypt;
