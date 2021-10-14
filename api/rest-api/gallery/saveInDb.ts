import { checkConnect } from '@services/mongo-connect';
//import {fileMetadata} from 'file-metadata';
import { getUserIdFromToken } from '../getUserIdFromToken';
import { imageModel } from '@models/MongoDB/ImageSchema';

/*
 * work after user request on upload file to the server
 */
export async function saveImgInDb(event, parseEvent) {
  await checkConnect;
  const userId = await getUserIdFromToken(event);

  const image = new imageModel({
    path: `/img/` + parseEvent.img.filename,
    metadata: 'have some bug',
    userId: userId,
  });

  const result = customInsertOne(image);

  if (result) {
    console.log('img was add');
  } else {
    console.log('img exist');
  }
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
