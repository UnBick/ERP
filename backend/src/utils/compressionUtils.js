// compressionUtils.js

const fs = require('fs');
const archiver = require('archiver');
const extract = require('extract-zip');

/**
 * Compresses the source directory into a ZIP file.
 * @param {string} sourceDir - The directory to compress.
 * @param {string} outPath - The path (including filename) where the ZIP file will be written.
 * @returns {Promise<void>}
 */
function compress(sourceDir, outPath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => resolve());
    archive.on('error', (err) => reject(err));

    archive.pipe(output);
    // Append the entire directory. The second parameter (false) ensures that the directory contents are
    // added without including the directory itself in the archive.
    archive.directory(sourceDir, false);
    archive.finalize();
  });
}

/**
 * Decompresses a ZIP archive into the destination directory.
 * @param {string} zipPath - The path to the ZIP file.
 * @param {string} destDir - The destination directory where the ZIP contents will be extracted.
 * @returns {Promise<void>}
 */
async function decompress(zipPath, destDir) {
  try {
    await extract(zipPath, { dir: destDir });
  } catch (error) {
    throw error;
  }
}

module.exports = { compress, decompress };
