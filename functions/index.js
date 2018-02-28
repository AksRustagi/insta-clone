const functions = require('firebase-functions');
const os = require('os');
const path = require('path');
const spawn = require('child-process-promise').spawn;
const cors = require('cors')({origin:true});
const Busboy = require('busboy');
const fs = require('fs');

const gcconfig = {     
  projectId: 'top-shelf-708be',
  keyFilename: 'top-shelf-708be-firebase-adminsdk-gi7rg-eaad29cef2.json'
};

const gcs = require('@google-cloud/storage')(gcconfig);

exports.onFileChange = functions.storage.object().onChange(event => {
  const object = event.data;
  const bucket = object.bucket;
  const contentType = object.contentType;
  const filePath = object.name;
  // console.log('event is ', event)
  console.log('File change detected, starting function');

  if(object.resourceState === 'not_exists'){
    console.log('we deleted a file, exit...')
    return;
  }
  if(path.basename(filePath).startsWith('resized-')) {
    console.log('we already renamed this file!');
    return;
  }

  const destBucket = gcs.bucket(bucket);
  const tmpFilePath = path.join(os.tmpdir(), path.basename(filePath));
  const metadata = { contentType: contentType };

  return destBucket.file(filePath).download({
    destination: tmpFilePath
}).then(() => {
  return spawn('convert', [tmpFilePath, '-resize', '100x100', tmpFilePath]);
}).then(() => {
  return destBucket.upload(tmpFilePath, {
    destination: 'resized-' + path.basename(filePath),
    metadata: metadata
  });
});
});




//upload file to http endpoint
exports.uploadFile = functions.https.onRequest((req, res) => {
  //check request method, mobile app cors taken care of
  cors(req, res, () => {
    console.log('entering http post logic');
  if (req.method !== 'POST') {
    return res.status(500).json({
      message: 'Not allowed'
    });
  } 
  //busboy used to parse data
  const busboy = new Busboy({ headers: req.headers });
  let uploadData = null;
//once parsed, handle it
  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    console.log('entering busboy logic');
    const filepath = path.join(os.tmpdir(), filename);
    uploadData = { file: filepath, type: mimetype }; 
    file.pipe(fs.createWriteStream(filepath));
  });
  
  busboy.on('finish', () => {
    console.log('entering busboy finish logic');
    const bucket = gcs.bucket('top-shelf-708be.appspot.com'); 
    bucket.upload(uploadData.file, {
      uploadType: 'media',
      metadata: {
        metadata: {
          contentType: uploadData.type
        }
      } 
    })
    .then(() => {
      console.log('entering then logic');
      return res.status(200).json({
        message: 'It worked!'
      });
    })
    .catch(err => {
      console.log('entering catch post logic');
      res.status(500).json({
        error: err
      });
    });
  });
  busboy.end(req.rawBody);
  });
});