import { checkConnect } from '@services/mongo-connect';
import fileMetadata from 'file-metadata';
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
    metadata: await fileMetadata(`/img/` + parseEvent.img.filename),
    userId: userId,
  });

  const result = customInsertOne(image);

  if (!result) {
    throw { errorMessage: 'img exist' };
  } else {
    await checkConnect.close();
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
