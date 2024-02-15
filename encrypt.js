const alert = require('cli-alerts');
const fs = require('fs');
const jimp = require('jimp');
const path = require('path');
const readline = require('readline');

// Helper function to ask a question in the console
function askQuestion(query) {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});
	return new Promise(resolve =>
		rl.question(query, ans => {
			rl.close();
			resolve(ans);
		})
	);
}

const encrypt = async flags => {
	// Check if flags contain decrypt flag
	if (flags.decrypt) {
		alert({
			type: 'warning',
			name: 'Invalid combination of flags',
			msg: 'Cannot use both --encrypt and --decrypt flags together'
		});
		process.exit(1);
	}

	// Get the file path to encrypt
	const filePath = flags.encrypt;

	// Validate file path
	if (!filePath) {
		alert({
			type: 'warning',
			name: 'Invalid file path',
			msg: 'Please provide a valid file path'
		});
		process.exit(1);
	}

	const cwd = process.cwd();
	const fullPath = path.join(cwd, filePath);

	if (!fs.existsSync(fullPath)) {
		alert({
			type: 'warning',
			name: 'Invalid file path',
			msg: 'Please provide a valid file path'
		});
		process.exit(1);
	}

	try {
		// Read and process the image
		const image = await jimp.read(fullPath);
		const extension = image.getExtension();

		// Check if the image is a jpeg/jpg
		if (extension === 'jpeg' || extension === 'jpg') {
			const proceed = await askQuestion(
				'The image you are trying to encrypt is a jpeg/jpg. Some information may be lost. Do you want to proceed? (y/n)\n'
			);
			if (proceed.toLowerCase() !== 'y') {
				process.exit(0);
			}
		}

		// Handle output image file name
		let outputImageFile = `${path.basename(filePath, path.extname(filePath))}_encrypted.${extension}`;

		if (flags.outputImageFileName) {
			outputImageFile = path.basename(flags.outputImageFileName);
			if (!path.extname(outputImageFile)) {
				outputImageFile += `.${extension}`;
			}
		}

		// Check and create output image file
		if (fs.existsSync(outputImageFile)) {
			alert({
				type: 'error',
				name: 'Invalid output image file name',
				msg: `The output image file already exists: ${outputImageFile}. Please provide a different name.`
			});
			process.exit(1);
		}

		// Handle output key file name
		let outputKeyFile = `${path.basename(filePath, path.extname(filePath))}_key.txt`;

		if (flags.outputKeyFileName) {
			outputKeyFile = path.basename(flags.outputKeyFileName);
		}

		if (fs.existsSync(outputKeyFile)) {
			alert({
				type: 'error',
				name: 'Invalid output key file name',
				msg: `The output key file already exists: ${outputKeyFile}. Please provide a different name.`
			});
			process.exit(1);
		}

		// Encrypt the image
		image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
			image.bitmap.data[idx] ^= Math.floor(Math.random() * 256);
			image.bitmap.data[idx + 1] ^= Math.floor(Math.random() * 256);
			image.bitmap.data[idx + 2] ^= Math.floor(Math.random() * 256);
		});

		// Save the encrypted image
		image.write(outputImageFile);

		// Save the encryption key
		const key = Array.from({ length: image.bitmap.data.length }, () => Math.floor(Math.random() * 256));
		fs.writeFileSync(outputKeyFile, Buffer.from(key).toString('base64'));

		// Success message
		alert({
			type: 'success',
			name: 'Image encrypted successfully',
			msg: `Image encrypted successfully:\nEncrypted Image: ${outputImageFile}\nKey: ${outputKeyFile}`
		});
	} catch (error) {
		alert({
			type: 'error',
			name: 'Error',
			msg: `${error || 'An unknown error occurred'}`
		});
		process.exit(1);
	}
};

module.exports = encrypt;
