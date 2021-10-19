import { errorHandler } from '@helper/http-api/error-handler';
import { createResponse } from '@helper/http-api/response';
import { log } from '@helper/logger';
import { APIGatewayLambdaEvent } from '@interfaces/api-gateway-lambda.interface';
import { MediaInfoCurlService } from '@services/media-info-curl.service';
import { APIGatewayProxyHandlerV2, Handler } from 'aws-lambda';
import { MediaInfoUrl } from './gallery.inteface';
import { GalleryManager } from './gallery.manager';

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

export const getHandler: Handler<APIGatewayLambdaEvent<null>, any> = async (event) => {
  //log(event);

  try {
    /**
     * Create the manager object
     */
    const manager = new GalleryManager();

    /**
     * Prepare required data
     */
    // const mediaInfoUrl: MediaInfoUrl = JSON.parse(event.body!);

    /**
     * Prepare required services
     */
    //const mediaInfoCurlService = new MediaInfoCurlService();

    /**
     * Call the manager's method
     */
    const dbResult = await manager.checkFilterAndFindInDb(event);
    const result = await manager.createGalleryObject(event, dbResult);

    // const result = await manager.getMediaInfo(mediaInfoUrl, mediaInfoCurlService);

    return createResponse(200, result);
  } catch (e) {
    /**
     * Handle all errors
     */
    return errorHandler(e);
  }
};
