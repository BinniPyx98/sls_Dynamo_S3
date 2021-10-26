import { GetItemCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { getEnv } from '@helper/environment';
import { log } from '@helper/logger';
import { imageModel } from '@models/MongoDB/image.model';
import { dynamoClient } from '@services/dynamo-connect';
import { S3Service } from '@services/s3.service';
import { PutObjectOutput } from 'aws-sdk/clients/s3';
import { exec } from 'child_process';
import * as jwt from 'jsonwebtoken';
import { GalleryObject } from './gallery.inteface';

export class GalleryService {
  async checkFilterAndFindInDb(event) {
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
    log('filterResult=' + JSON.stringify(result));
    return { result: result, img: total };
  }

  async getImageForResponse__ForFilterAll(userIdFromRequest: string, pageNumber: number, limit: number) {
    const all_Images = {
      TableName: 'Gallery',
      Key: {
        email: { S: 'All' },
      },
    };
    const myImages = {
      TableName: 'Gallery',
      Key: {
        email: { S: userIdFromRequest },
      },
    };
    const allImgFromDynamo = await dynamoClient.send(new GetItemCommand(all_Images));
    const userImgFromDynamo = await dynamoClient.send(new GetItemCommand(myImages));
    let allArrayPath = [];
    let userArrayPath = [];

    if (!userImgFromDynamo.Item!.imageObject) {
      userArrayPath = [];
    } else {
      for (const item of userImgFromDynamo.Item!.imageObject.L!) {
        // @ts-ignore
        userArrayPath.push(item.L[1]);
      }
    }


    if (!allImgFromDynamo.Item!.imageObject) {
      allArrayPath = [];
    } else {
      for (const item of allImgFromDynamo.Item!.imageObject.L!) {
        // @ts-ignore
        allArrayPath.push(item.L[1]);
      }
    }

    const contArray = allArrayPath!.concat(userArrayPath!);

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

  async getImageForResponse__ForFilterMyImage(userIdFromRequest: string, pageNumber: number, limit: number) {
    const myImages = {
      TableName: 'Gallery',
      Key: {
        email: { S: userIdFromRequest },
      },
    };
    const userImgFromDynamo = await dynamoClient.send(new GetItemCommand(myImages));
    let userArrayPath = [];

    if (!userImgFromDynamo.Item!.imageObject) {
      userArrayPath = [];
    } else {
      for (const item of userImgFromDynamo.Item!.imageObject.L!) {
        // @ts-ignore
        userArrayPath.push(item.L[1]);
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

  async createGalleryObject(event, dbResult): Promise<GalleryObject> {
    const pageNumber = Number(event.queryStringParameters.page);
    const limit = Number(event.queryStringParameters.limit);
    let imagePathArray: Array<string> = []; //img path array

    const total = dbResult.total;

    imagePathArray = dbResult.result;

    const galleryObj = {
      total: total,
      page: Number(pageNumber),
      objects: imagePathArray,
    };

    return galleryObj;
  }

  async getUserIdFromToken(event): Promise<string> {
    log(event);
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

  async saveImgInDb(event, parseEvent, s3URL): Promise<void> {
    const userEmail = await this.getUserIdFromToken(event);
    const newImage = {
      TableName: 'Gallery',
      Key: {
        email: { S: userEmail },
      },
      UpdateExpression: 'SET #imageObject = :o',
      ExpressionAttributeNames: {
        '#imageObject': 'imageObject',
      },
      ExpressionAttributeValues: {
        ':o': {
          L: [
            {
              L: [
                {
                  L: [
                    { S: `${parseEvent.img.filename}` },
                    { S: `${parseEvent.img.contentType}` },
                    { S: `${event.headers['Content-Length']}` },
                  ],
                },
                {
                  S: `${s3URL.ETag}`,
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

  async fileMetadata(filePath: string): Promise<any> {
    exec(`mdls ${filePath}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`error: ${error.message}`);
        return;
      }

      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
      }

      return stdout;
    });
  }

  customInsertOne(image): boolean {
    let result;

    imageModel.findOne({ path: image.path }, (err, doc) => {
      if (err) {
        log(err);
      } else {
        if (!doc) {
          result = this.insertImg(image);
        } else {
          log({ errorMessage: 'img exist in db' });
          result = false;
        }
      }
    });
    return result;
  }

  insertImg(image) {
    let status;

    image.save(function (err, DbResult) {
      if (err) {
        log(err);
        status = false;
      }
      status = true;
    });
    return status;
  }

  async trySaveToS3(parseEvent) /*: Promise<PutObjectOutput>*/ {
    const s3 = new S3Service();
    log('ParseEvent= ' + JSON.stringify(parseEvent.headers));
    const result = await s3.put(
      `${parseEvent.img.filename}`,
      parseEvent.img.content,
      'kalinichenko',
      parseEvent.img.contentType
    );
    log('S3 result= ' + result);
    return result;
  }

  trySaveToMongoDb(event: any, parseEvent: any, s3Url): void {
    try {
      this.saveImgInDb(event, parseEvent, s3Url);
    } catch (err) {
      log(err);
      throw new Error('fail trySaveToMongoDb');
    }
  }
}
