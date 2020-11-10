import fse from 'fs-extra';
import os from 'os';
import fs, { createWriteStream } from 'fs';
import got from 'got';
import AdmZip from 'adm-zip';

export async function downloadAsset({
  name,
  url,
  terminal,
  path,
  modifier,
}) {
  const filepath = await _downloadRepo(url, terminal, name);
  let exist = await fse.pathExists(path);
  let destination = path;
  if (!exist) destination = process.cwd();
  destination = destination + `/${name}`;
  console.log(`Creating project at: ${destination}`);
  if (modifier) {
    await modifier(destination);
  }
  await _createLocalCopy(filepath, destination);
  await fse.remove(filepath);
  return filepath;
}

async function _createLocalCopy(source, destination) {
  return fse.copy(source, destination);
}

async function _downloadRepo(url, terminal, name) {
  const status = terminal.spinner('Downloading...');
  status.start();
  let directory = `${os.homedir}/.yac/temp/`;
  let file = `${name}.zip`;
  let filepath = directory + file;
  _createDir(directory);
  let response = await got.get(url);
  let redirect = response?.redirectUrls?.[0];
  if (!redirect) throw Error("Couldn't fetch template");
  return new Promise((resolve, reject) => {
    const downloadStream = got(redirect, { isStream: true })
      .on('downloadProgress', ({ transferred, total, percent }) => {
        const percentage = Math.round(percent * 100);
        status.message(
          `Download progress: ${transferred}/${total} (${percentage})%`,
        );
      })
      .on('error', (error) => {
        reject(`Download failed: ${error.message}`);
      });
    const fileWriterStream = createWriteStream(filepath)
      .on('error', (error) => {
        reject(`Could not write file to system: ${error.message}`);
      })
      .on('finish', () => {
        const zipFile = new AdmZip(filepath);
        status.message('Unzipping template...');
        let destination = directory + `${name}_temp`;
        zipFile.extractAllTo(destination, true);
        let dirList = fs.readdirSync(destination);
        let subdirectory = dirList?.[0];
        if (!subdirectory) throw "Couldn't find template";
        fse
          .move(
            destination + `/${subdirectory}`,
            directory + `${name}`,
            {
              overwrite: true,
            },
          )
          .then(() => {
            return fse.remove(destination);
          })
          .then(() => {
            resolve(directory + `${name}`);
          });
        status.stop();
      });
    downloadStream.pipe(fileWriterStream);
  });
}

function _createDir(path) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }
}
