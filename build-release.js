import { readFileSync, existsSync, mkdir, createWriteStream } from 'fs';
import archiver from 'archiver';

const outputDirectory = './release';
const manifestPath = './build/manifest.json';

const buildReleaseZip = (browser) => {

  let manifest = JSON.parse(readFileSync(manifestPath));
  let version = manifest.version;
  let releaseVersion = `X-Plane_Plugin_Manager_${version}`;

  let filename = `${releaseVersion}_${browser}.zip`;
  console.log(`Creating ${browser} release.`)

  if (!existsSync(outputDirectory)) {
    mkdir(outputDirectory, (err) => {
      if (err) {
        return console.error(err);
      }
    });
  }

  const output = createWriteStream(outputDirectory + '/' + filename);
  const archive = archiver('zip', {
    zlib: { level: 9 }
  });
  archive.pipe(output);

  // Add everything except the manifests to the archive
  archive.glob('!manifest*.json', { cwd: 'build' }, { prefix: releaseVersion + '/' });
  // Add the browser specific manifest to the archive
  archive.file(`build/manifest_${browser.toLowerCase()}.json`, { name: releaseVersion + '/manifest.json' });
  archive.finalize();

  archive.on('error', function(err) {
    throw err;
  });

  output.on('close', function() {
    console.log(`Succesfully created ${browser} release.`)
  });
}

const main = () => {
  const args = process.argv.slice(2);

  if (args.length == 0) {
    buildReleaseZip('Firefox');
    buildReleaseZip('Chrome');
  } else if (args[0].toLowerCase() === 'firefox') {
    buildReleaseZip('Firefox');
  } else {
    buildReleaseZip('Chrome');
  }
}

main();