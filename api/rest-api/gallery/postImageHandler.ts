// import { logger } from '../../logger/logger.js';
// import fs from 'fs';
// import { saveImgInDb } from '../saveInDb/saveInDb.js';
// import { __pathToGallery } from '../pathToGallery.js';
//
// let galleryPageNumber = 1;
// let imageName = '';
//
//
//
// import { log } from '@helper/logger';
// import { Handler } from 'aws-lambda';
// import { errorHandler } from '@helper/rest-api/error-handler';
// import { APIGatewayLambdaEvent } from '@interfaces/api-gateway-lambda.interface';
//
// export const handler: Handler<APIGatewayLambdaEvent<null>, string> = async (event) => {
//   log(event);
//
//   try {
//     return 'Hi!';
//   } catch (error) {
//     errorHandler(error);
//   }
// };
//
//
//
// /*
//  * upload image in dir and db
//  */
// export const postImageHandler:Handler<APIGatewayLambdaEvent<null>,string>=async (event)=>{
//
//   const fileData = event.files.img;
//
//   galleryPageNumber = Number(request.query.page);
//   imageName = fileData.name;
//
//
//   if (fileData) {
//     logger.info({ message: 'postImageHandler: try upload img' });
//
//     trySaveToDir(imageName, fileData.data, response, next);
//
//     trySaveToMongoDb(request, response);
//
//   } else {
//     logger.info({ errorMessage: 'request.files error' });
//   }
// }
//
// function trySaveToDir(imageName: String, Image: Buffer, response, next) {
//
//   fs.writeFile(`${__pathToGallery}/img/${imageName}`, Image, { flag: 'wx' }, (err) => {
//     if (err) {
//       console.log(err);
//       response.status(208).send({ errorMessage: err });
//       next(err);
//     } else {
//       logger.info({ message: 'Image success saved in dir' });
//     }
//   });
//
// }
//
// function trySaveToMongoDb(request: Request, response: Response) {
//   try {
//     saveImgInDb(request, response);
//
//   } catch (err) {
//     console.log(err);
//     logger.info({ errorMessage: 'trySaveToMongoDb: error save to db' });
//     response.status(500).send({ errorMessage: 'trySaveToMongoDb: error save to db' });
//     throw new Error('fail trySaveToMongoDb');
//
//   }
// }
