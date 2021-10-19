import connect from '@services/mongo-connect';
import { exec } from 'child_process';
import { getUserIdFromToken } from './getUserIdFromToken';
import { imageModel } from '@models/MongoDB/ImageSchema';

/*
 * work after user request on upload file to the server
 */
export async function saveImgInDb(event, parseEvent) {
  const connectToMongo = connect();
  console.log(connectToMongo);
  const userId = await getUserIdFromToken(event);
  const image = new imageModel({
    path: `/img/` + parseEvent.img.filename,
    metadata: await fileMetadata(
      `/Users/pm/Desktop/Astra/projects/module3/part1/sls/flo.sls/img/` + parseEvent.img.filename
    ),
    userId: userId,
  });

  const result = customInsertOne(image);

  if (result) {
    console.log('img was add');
  } else {
    console.log('img exist');
  }
}

async function fileMetadata(filePath) {
  exec(`mdls ${filePath}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`error: ${error.message}`);
      return;
    }

    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }

    return stdout;
  });
}

function customInsertOne(image) {
  let result;

  imageModel.findOne({ path: image.path }, (err, doc) => {
    if (err) {
      console.log(err);
    } else {
      if (!doc) {
        result = insertImg(image);
      } else {
        console.log({ errorMessage: 'img exist in db' });
        result = false;
      }
    }
  });
  return result;
}

function insertImg(image) {
  let status;

  image.save(function (err, DbResult) {
    if (err) {
      console.log(err);
      status = false;
    }
    status = true;
  });
  return status;
}
