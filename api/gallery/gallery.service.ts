import { GetItemCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { getEnv } from '@helper/environment';
import { log } from '@helper/logger';
import { dynamoClient } from '@services/dynamo-connect';
import { S3Service } from '@services/s3.service';
import * as jwt from 'jsonwebtoken';
import { DatabaseResult, GalleryObject, Metadata } from './gallery.inteface';
import { unmarshall } from '@aws-sdk/util-dynamodb';

export class GalleryService {
  async checkFilterAndFindInDb(event): Promise<DatabaseResult> {
    const pageNumber = Number(event.queryStringParameters.page);
    const limit = Number(event.queryStringParameters.limit);
    const userIdFromRequest = await this.getUserIdFromToken(event);
    log(userIdFromRequest);
    let objectTotalAndImage;
    let result;
    let total;

    if (event.queryStringParameters.filter === 'All') {
      objectTotalAndImage = await this.getImageForResponse__ForFilterAll(userIdFromRequest, pageNumber, limit);
      total = objectTotalAndImage.total;
      result = objectTotalAndImage.result;
    } else {
      objectTotalAndImage = await this.getImageForResponse__ForFilterMyImage(userIdFromRequest, pageNumber, limit);
      total = objectTotalAndImage.total;
      result = objectTotalAndImage.result;
    }
    //log('filterResult=' + JSON.stringify(result));
    return { result: result, total: total };
  }

  async getImageForResponse__ForFilterAll(
    userIdFromRequest: string,
    pageNumber: number,
    limit: number
  ): Promise<DatabaseResult> {
    const all_Images = {
      TableName: 'Kalinichecko-prod-Gallery',
      Key: {
        email: { S: 'All' },
      },
    };
    const myImages = {
      TableName: 'Kalinichecko-prod-Gallery',
      Key: {
        email: { S: userIdFromRequest },
      },
    };
    const allImgFromDynamo = await dynamoClient.send(new GetItemCommand(all_Images));
    const userImgFromDynamo = await dynamoClient.send(new GetItemCommand(myImages));
    let allArrayPath = [];
    let userArrayPath = [];
    const presentUserImageObject = Boolean(userImgFromDynamo.Item?.imageObject);
    const presentAllImageObject = Boolean(allImgFromDynamo.Item?.imageObject);
    log('test user and All' + presentAllImageObject + ' ' + presentUserImageObject);
    if (!presentUserImageObject) {
      userArrayPath = [];
    } else {
      for (const item of userImgFromDynamo.Item!.imageObject.L!) {
        // @ts-ignore
        userArrayPath.push(item.L[1]);
      }
    }

    if (!presentAllImageObject) {
      allArrayPath = [];
    } else {
      for (const item of allImgFromDynamo.Item!.imageObject.L!) {
        // @ts-ignore
        allArrayPath.push(item.L[1]);
      }
    }

    const contArray = allArrayPath.concat(userArrayPath);

    const total = Math.ceil(Number(contArray.length) / limit);
    const skip = Number((pageNumber - 1) * limit);
    let limitCounter = 0;
    const result = [];
    for (let i = skip; limitCounter < limit && i < contArray.length; i++) {
      limitCounter++;
      // @ts-ignore
      result.push(contArray[i]);
    }
    return { result: result, total: total };
  }

  async getImageForResponse__ForFilterMyImage(
    userIdFromRequest: string,
    pageNumber: number,
    limit: number
  ): Promise<DatabaseResult> {
    const myImages = {
      TableName: 'Kalinichecko-prod-Gallery',
      Key: {
        email: { S: userIdFromRequest },
      },
    };
    const userImgFromDynamo = await dynamoClient.send(new GetItemCommand(myImages));
    const unmarshallImagePathArray = unmarshall(userImgFromDynamo.Item!);
    let userArrayPath = [];

    if (!userImgFromDynamo.Item!.imageObject) {
      userArrayPath = [];
    } else {
      for (const item of unmarshallImagePathArray.imageObject) {
        // @ts-ignore
        userArrayPath.push(item[1]);
      }
    }
    log(userArrayPath);
    const total = Math.ceil(Number(userArrayPath.length) / limit);
    const skip = Number((pageNumber - 1) * limit);
    let limitCounter = 0;
    const result = [];
    for (let i = skip; limitCounter < limit && i < userArrayPath.length; i++) {
      limitCounter++;
      // @ts-ignore
      result.push(userArrayPath[i]);
    }
    log(result);
    return { result: result, total: total };
  }

  async createGalleryObject(event, dbResult: DatabaseResult): Promise<GalleryObject> {
    const pageNumber = Number(event.queryStringParameters.page);
    const limit = Number(event.queryStringParameters.limit);
    let imagePathArray: Array<string> = []; //img path array

    const total = dbResult.total;

    imagePathArray = dbResult.result;
    log('dbresult = ' + dbResult.result);

    const galleryObj = {
      total: total,
      page: Number(pageNumber),
      objects: imagePathArray,
    };

    return galleryObj;
  }
  async getUserIdFromToken(event): Promise<string> {
    const tokenKey = getEnv('TOKEN_KEY');
    let userIdFromToken;
    const bearerHeader = event.headers.Authorization;
    if (bearerHeader) {
      const bearer = bearerHeader.split(' ');
      const bearerToken = bearer[1];

      jwt.verify(bearerToken, tokenKey, function (err, decoded) {
        userIdFromToken = decoded.id;
      });
    }
    return userIdFromToken;
  }

  async updateStatus(userEmail, imageTagInS3) {
    const myImages = {
      TableName: 'Kalinichecko-prod-Gallery',
      Key: {
        email: { S: userEmail },
      },
    };
    const allImgFromDynamo = await dynamoClient.send(new GetItemCommand(myImages));
    const unmarshallImagePathArray = unmarshall(allImgFromDynamo.Item!);
    let lastImage = 0;
    for (const item of unmarshallImagePathArray.imageObject) {
      // @ts-ignore
      lastImage++;
    }
    lastImage--;
    log('last image index = ' + lastImage);
    log('userEmail in function updateStatus = ' + userEmail);
    const newImage = {
      TableName: 'Kalinichecko-prod-Gallery',
      Key: {
        email: { S: userEmail },
      },
      //UpdateExpression: 'SET #imageObject = list_append(#imageObject, :o)',
      UpdateExpression: `SET #imageObject[${lastImage}][${1}] = :o`,
      ExpressionAttributeNames: {
        '#imageObject': 'imageObject',
      },
      ExpressionAttributeValues: {
        ':o': {
          S: 'CLOSE',
          S: `${imageTagInS3}`,
        },
      },
      ReturnValues: 'UPDATED_NEW',
    };

    const res = await dynamoClient.send(new UpdateItemCommand(newImage));
    log(res);
  }
  async saveImgMetadata(event, metadata: Metadata): Promise<void> {
    const userEmail = await this.getUserIdFromToken(event);
    const newImage = {
      TableName: 'Kalinichecko-prod-Gallery',
      Key: {
        email: { S: userEmail },
      },
      UpdateExpression: 'SET #imageObject = list_append(#imageObject, :o)',
      //UpdateExpression: 'SET #imageObject = :o',
      ExpressionAttributeNames: {
        '#imageObject': 'imageObject',
      },
      ExpressionAttributeValues: {
        ':o': {
          L: [
            {
              L: [
                {
                  L: [{ S: `${metadata.filename}` }, { S: `${metadata.contentType}` }, { S: `${metadata.size}` }],
                },
                // {
                //   S: `${s3URL}`,
                // },
                {
                  S: 'OPEN',
                },
              ],
            },
          ],
        },
      },
    };

    const res = await dynamoClient.send(new UpdateItemCommand(newImage));
    log(res);
  }

  // async fileMetadata(filePath: string): Promise<any> {
  //   exec(`mdls ${filePath}`, (error, stdout, stderr) => {
  //     if (error) {
  //       console.error(`error: ${error.message}`);
  //       return;
  //     }
  //
  //     if (stderr) {
  //       console.error(`stderr: ${stderr}`);
  //       return;
  //     }
  //
  //     return stdout;
  //   });
  // }
  // insertImg(image): boolean {
  //   let status;
  //
  //   image.save(function (err, DbResult) {
  //     if (err) {
  //       log(err);
  //       status = false;
  //     }
  //     status = true;
  //   });
  //   return status;
  // }

  async getUrlForUploadToS3(event, metadata: Metadata): Promise<string> {
    const userEmail = await this.getUserIdFromToken(event);
    const s3 = new S3Service();
    const url = s3.getPreSignedPutUrl(userEmail + '/' + metadata.filename, getEnv('S3_NAME'));
    log(url);
    return url;
  }

  // trySaveToMongoDb(event, parseEvent: any, s3Url): void {
  //   try {
  //     this.saveImgInDb(event, parseEvent, s3Url);
  //   } catch (err) {
  //     log(err);
  //     throw new Error('fail trySaveToMongoDb');
  //   }
  // }
}
