import { errorHandler } from '@helper/http-api/error-handler';
import { log } from '@helper/logger';
import { APIGatewayLambdaEvent } from '@interfaces/api-gateway-lambda.interface';
import { Handler } from 'aws-lambda';
import { GetGalleryObject } from './gallery.inteface';
import { GalleryManager } from './gallery.manager';
import * as multipart from 'aws-lambda-multipart-parser';

export const getGallery: Handler<APIGatewayLambdaEvent<GetGalleryObject>, any> = async (event) => {
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

export const postImageHandler: Handler<APIGatewayLambdaEvent<string>, any> = async (event) => {
  //log(event);
  const manager = new GalleryManager();
  let parseEvent;
  try {
    parseEvent = multipart.parse(event, true);
  } catch (err) {
    return {
      statusCode: 415,
      body: JSON.stringify({
        message: 'request have not file',
        body: err,
      }),
    };
  }
  const s3Url = await manager.trySaveToS3(parseEvent);
  log('seUrl=' + JSON.stringify(s3Url));
  manager.trySaveToMongoDb(event, parseEvent, s3Url);
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'img save',
    }),
  };
};
