import {
  GetItemCommand,
  PutItemCommand,
  QueryCommand,
  QueryCommandInput,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import { getEnv } from '@helper/environment';
import { log } from '@helper/logger';
import { dynamoClient } from '@services/dynamo-connect';
import { S3Service } from '@services/s3.service';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { DatabaseResult, GalleryObject, Metadata } from './gallery.inteface';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

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
    const all_Images: QueryCommandInput = {
      TableName: getEnv('GALLERY_TABLE_NAME'),
      KeyConditionExpression: '#userEmail = :user',
      ExpressionAttributeNames: {
        '#userEmail': 'email',
      },
      ExpressionAttributeValues: marshall({
        ':user': 'All',
      }),
    };
    const myImages: QueryCommandInput = {
      TableName: getEnv('GALLERY_TABLE_NAME'),
      KeyConditionExpression: '#userEmail = :user',
      ExpressionAttributeNames: {
        '#userEmail': 'email',
      },
      ExpressionAttributeValues: marshall({
        ':user': userIdFromRequest,
      }),
    };
    const allImgFromDynamo = await dynamoClient.send(new QueryCommand(all_Images));
    const userImgFromDynamo = await dynamoClient.send(new QueryCommand(myImages));
    // @ts-ignore
    let allArrayPath = [];
    let userArrayPath = [];
    const presentUserImageObject = userImgFromDynamo.Items;
    const presentAllImageObject = allImgFromDynamo.Items;

    if (presentUserImageObject?.length == 0) {
      userArrayPath = [];
    } else {
      for (const item of userImgFromDynamo.Items!) {
        for (const prop in item) {
          log('prop = ' + prop);
          if (prop === 'urlImage') {
            log('item.urlImage.S = ' + item.urlImage.S);
            // @ts-ignore
            userArrayPath.push(item.urlImage.S);
          }
        }
        // @ts-ignore
      }
    }

    if (presentAllImageObject?.length == 0) {
      allArrayPath = [];
    } else {
      for (const item of allImgFromDynamo.Items!) {
        for (const prop in item) {
          if (prop === 'urlImage') {
            log('item in all = ' + item.urlImage.S);
            // @ts-ignore
            allArrayPath.push(item.urlImage.S);
          }
        }
      }
    }

    const contArray = allArrayPath.concat(userArrayPath);
    log('cont Array= ' + contArray);
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
      TableName: getEnv('GALLERY_TABLE_NAME'),
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
        userArrayPath.push(item[2]);
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

  async updateStatus(userEmail: string, imageUrl: string, fileName: string): Promise<void> {
    const hashImage = crypto.createHmac('sha256', 'test').update(fileName).digest('hex');

    const updateItem = {
      TableName: getEnv('GALLERY_TABLE_NAME'),
      Key: marshall({
        email: userEmail,
        password: 'imageHash_' + hashImage,
      }),
      UpdateExpression: 'set imageStatus = :v_status, urlImage = :newUrl',
      ExpressionAttributeValues: marshall({
        ':v_status': 'CLOSE',
        ':newUrl': imageUrl,
      }),
    };
    const updateStatus = await dynamoClient.send(new UpdateItemCommand(updateItem));
    log('updateStatus = ' + updateStatus);
  }
  async saveImgMetadata(event, metadata: Metadata): Promise<void> {
    const userEmail = await this.getUserIdFromToken(event);
    log(metadata.filename);
    const hashImage = crypto.createHmac('sha256', 'test').update(metadata.filename).digest('hex');

    const newUser = {
      TableName: getEnv('GALLERY_TABLE_NAME'),
      Item: marshall({
        email: userEmail,
        imageName: metadata.filename,
        password: 'imageHash_' + hashImage,
        extension: metadata.contentType,
        imageSize: metadata.size,
        imageStatus: 'OPEN',
      }),
    };
    await dynamoClient.send(new PutItemCommand(newUser));
  }
  async getUrlForUploadToS3(event, metadata: Metadata): Promise<string> {
    const userEmail = await this.getUserIdFromToken(event);
    const s3 = new S3Service();
    const url = s3.getPreSignedPutUrl(userEmail + '/' + metadata.filename, getEnv('S3_NAME'));
    log(url);
    return url;
  }
}
