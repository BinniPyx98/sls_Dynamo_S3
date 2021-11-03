import { errorHandler } from '@helper/http-api/error-handler';
import { log } from '@helper/logger';
import { APIGatewayLambdaEvent } from '@interfaces/api-gateway-lambda.interface';
import { Handler, S3Handler } from 'aws-lambda';
import { ResolveObject } from './gallery.inteface';
import { GalleryManager } from './gallery.manager';

export const getGallery: Handler<APIGatewayLambdaEvent<any>, ResolveObject> = async (event) => {
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
      headers: {
        'Access-Control-Allow-Headers': 'Authorization',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': '*',
      },
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

export const getS3Url: Handler<APIGatewayLambdaEvent<any>, any> = async (event) => {
  const metadataFormEvent = JSON.parse(event.body);
  const metadata = {
    filename: metadataFormEvent.filename,
    size: metadataFormEvent.size,
    contentType: metadataFormEvent.contentType,
  };
  const manager = new GalleryManager();
  const response = await manager.getUrlForUploadToS3(event, metadata);
  await manager.saveImgMetadata(event, metadata);
  log('response = ' + response);
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Headers': 'Authorization',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
    },
    body: JSON.stringify(response),
  };
};

export const triggerS3Upload: S3Handler = async (event) => {
  log(event);
  const user = event.Records[0].s3.object.key.split('%')[0];
  const imageTagInS3 = decodeURIComponent(event.Records[0].s3.object.key);
  log('FileKey = ' + imageTagInS3);
  const userEmail = user + '@flo.team';
  log('userEmail = ' + userEmail);
  const manager = new GalleryManager();
  await manager.updateStatus(userEmail, imageTagInS3);
};
