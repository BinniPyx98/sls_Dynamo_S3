import { errorHandler } from '@helper/http-api/error-handler';
import { log } from '@helper/logger';
import { APIGatewayLambdaEvent } from '@interfaces/api-gateway-lambda.interface';
import { Handler } from 'aws-lambda';
import { getGalleryInterface } from './gallery.inteface';
import { GalleryManager } from './gallery.manager';
import * as multipart from 'aws-lambda-multipart-parser';

/**
 * It's required if you use any external executable files like mediainfo-curl
 */
if (process.env.LAMBDA_TASK_ROOT) {
  process.env.PATH = `${process.env.PATH}:${process.env.LAMBDA_TASK_ROOT}/bin`;
}

export const getGallery: Handler<APIGatewayLambdaEvent<getGalleryInterface>, any> = async (event) => {
  log(event);

  try {
    const manager = new GalleryManager();
    /**
     * Call the manager's method
     */
    const dbResult = await manager.checkFilterAndFindInDb(event);
    const result = await manager.createGalleryObject(event, dbResult);

    return {
      statusCode: 200,
      body: JSON.stringify({
        input: result,
      }),
    };
  } catch (e) {
    /**
     * Handle all errors
     */
    return errorHandler(e);
  }
};

let imageName = '';

export const postImageHandler: Handler<APIGatewayLambdaEvent<string>, string> = async (event) => {
  log(event);
  const manager = new GalleryManager();
  const parseEvent = multipart.parse(event, true);
  const fileData = parseEvent.img;
  imageName = fileData.filename;

  if (!fileData) {
    return 'request have not file';
  } else {
    manager.trySaveToDir(imageName, fileData.content);
    manager.trySaveToMongoDb(event, parseEvent);
    return 'img save';
  }
};
