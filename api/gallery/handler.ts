import { errorHandler } from '@helper/http-api/error-handler';
import { createResponse } from '@helper/http-api/response';
import { log } from '@helper/logger';
import { APIGatewayLambdaEvent } from '@interfaces/api-gateway-lambda.interface';
import { Handler } from 'aws-lambda';
import { MediaInfoUrl } from './gallery.inteface';
import { GalleryManager } from './gallery.manager';
import * as multipart from 'aws-lambda-multipart-parser';
import * as fs from 'fs';

/**
 * It's required if you use any external executable files like mediainfo-curl
 */
if (process.env.LAMBDA_TASK_ROOT) {
  process.env.PATH = `${process.env.PATH}:${process.env.LAMBDA_TASK_ROOT}/bin`;
}

/**
 * This is a handler file
 * It should contain Lambda functions for one feature
 * For example, Media Info feature
 * Or CRUD operations for the user entity
 */

/**
 * This is a Lambda function
 * It implements some functionality of the feature
 *
 * It should only create a feature manager object and call the manager's method
 * All required data should be provided to the manager's method
 * Do not provide event or context objects
 * You should create interfaces for required data
 * All required services except feature service should be provided to the manager's method
 *
 * This function should handle all errors and return them with proper structure
 * @param event - APIGateway, SQS Trigger, SNS Trigger, etc. event object
 * @param context
 */

export const getGallery: Handler<APIGatewayLambdaEvent<null>, any> = async (event) => {
  //log(event);

  try {
    const manager = new GalleryManager();
    /**
     * Call the manager's method
     */
    const dbResult = await manager.checkFilterAndFindInDb(event);
    const result = await manager.createGalleryObject(event, dbResult);
    return createResponse(200, result);
  } catch (e) {
    /**
     * Handle all errors
     */
    return errorHandler(e);
  }
};

let imageName = '';

export const postImageHandler: Handler<APIGatewayLambdaEvent<null>, string> = async (event) => {
  const manager = new GalleryManager();
  const parseEvent = multipart.parse(event, true);
  const fileData = parseEvent.img;
  imageName = fileData.filename;

  if (!fileData) {
    return "request haven't file";
  } else {
    manager.trySaveToDir(imageName, fileData.content);
    manager.trySaveToMongoDb(event, parseEvent);
    return 'img save';
  }
};
