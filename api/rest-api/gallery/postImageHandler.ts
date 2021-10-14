import * as multipart from 'aws-lambda-multipart-parser';
import * as fs from 'fs';
import { Handler } from 'aws-lambda';
import { saveImgInDb } from './saveInDb';
import { APIGatewayLambdaEvent } from '@interfaces/api-gateway-lambda.interface';

let galleryPageNumber = 1;
let imageName = '';

/*
 * upload image in dir and db
 */
export const postImageHandler: Handler<APIGatewayLambdaEvent<null>, string> = async (event) => {
  const parseEvent = multipart.parse(event, true);
  const fileData = parseEvent.img;
  galleryPageNumber = Number(event.query.page);
  imageName = fileData.filename;

  if (fileData) {
    trySaveToDir(imageName, fileData.content);
    trySaveToMongoDb(event, parseEvent);
    return '200';
  } else {
    return "request haven't file";
  }
};

function trySaveToDir(imageName: string, Image: Buffer) {
  fs.writeFile(
    `/Users/pm/Desktop/Astra/projects/module3/part1/sls/flo.sls/img/${imageName}`,
    Image,
    { flag: 'wx' },
    (err) => {
      if (err) {
        console.log(err);
      }
    }
  );
}

function trySaveToMongoDb(event: any, parseEvent: any) {
  try {
    saveImgInDb(event, parseEvent);
  } catch (err) {
    console.log(err);
    throw new Error('fail trySaveToMongoDb');
  }
}
