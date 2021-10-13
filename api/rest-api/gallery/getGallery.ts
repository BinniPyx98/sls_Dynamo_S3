import { checkFilterAndFindInDb } from './checkFilterAndFindInDb';

/*
 * work aster user do get request on http://localhost:5400/gallery?page=<pageNumber>&filter=<filter>
 */

//import { log } from '@helper/logger';
import { Handler } from 'aws-lambda';
//import { errorHandler } from '@helper/rest-api/error-handler';
import { APIGatewayLambdaEvent } from '@interfaces/api-gateway-lambda.interface';

export const getHandler: Handler<APIGatewayLambdaEvent<null>, any> = async (event) => {
  const dbResult = await checkFilterAndFindInDb(event);
  return await createGalleryObject(event, dbResult);
};

async function createGalleryObject(event, dbResult) {
  const pageNumber = Number(event.query.page);
  const limit = Number(event.query.limit);
  const imagePathArray: Array<string> = []; //img path array

  try {
    const total = Math.ceil(Number(dbResult.img.length) / limit);

    for (const file of dbResult.result) {
      // @ts-ignore
      imagePathArray.push(String(file.path));
    }

    const galleryObj = {
      total: total,
      page: Number(pageNumber),
      objects: imagePathArray,
    };

    return galleryObj;
  } catch (err) {
    console.log(err);
  }
}
