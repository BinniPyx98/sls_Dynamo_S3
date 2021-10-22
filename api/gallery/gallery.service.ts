import { GetItemCommand } from '@aws-sdk/client-dynamodb';
import { baseErrorHandler } from '@helper/base-error-handler';
import { getEnv } from '@helper/environment';
import { log } from '@helper/logger';
import { imageModel } from '@models/MongoDB/image.model';
import { dynamoClient } from '@services/dynamo-connect';
import connect from '@services/mongo-connect';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as jwt from 'jsonwebtoken';
import { GalleryObject } from './gallery.inteface';

export class GalleryService {
  async checkFilterAndFindInDb(event) {
    log(event.queryStringParameters.page);
    log(event.queryStringParameters.limit);
    const pageNumber = Number(event.queryStringParameters.page);
    const limit = Number(event.queryStringParameters.limit);
    const userIdFromRequest = await this.getUserIdFromToken(event);
    log(userIdFromRequest);

    let objectTotalAndImage;
    let result;
    let img;

    if (event.queryStringParameters.filter === 'All') {
      objectTotalAndImage = await this.getImageForResponse__ForFilterAll(userIdFromRequest, pageNumber, limit);
      img = objectTotalAndImage.total;
      result = objectTotalAndImage.result;
    } else {
      objectTotalAndImage = await this.getImageForResponse__ForFilterMyImage(userIdFromRequest, pageNumber, limit);
      img = objectTotalAndImage.total;
      result = objectTotalAndImage.result;
    }
    return { result: result, img: img };
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
    const myImgFromDynamo = await dynamoClient.send(new GetItemCommand(myImages));
    const allArrayPath = myImgFromDynamo.Item!.object.SS;
    let myArrayPath = allImgFromDynamo.Item!.object.SS;
    if (myArrayPath === undefined) myArrayPath = [];
    const contArray = allArrayPath!.concat(myArrayPath!);
    const total = Math.ceil(Number(contArray.length) / limit);
    const skip = Number((pageNumber - 1) * limit);
    let limitCounter = 0;
    let result = [];
    for (let i = skip; limitCounter < limit && i < contArray.length; i++) {
      limitCounter++;
      result.push(contArray[i]);
    }

    // const imageFromDb = await imageMßodel
    //   .find({
    //     $or: [{ userId: userIdFromRequest }, { userId: '615aae0509d876c365438bf0' }],
    //   })
    //   .lean()
    //   .skip(Number((pageNumber - 1) * limit))
    //   .limit(limit);

    return { result: result, total: total };
  }

  async getImageForResponse__ForFilterMyImage(userIdFromRequest: string, pageNumber: number, limit: number) {
    const myImages = {
      TableName: 'Gallery',
      Key: {
        email: { S: userIdFromRequest },
      },
    };
    const allImgFromDynamo = await dynamoClient.send(new GetItemCommand(myImages));
    let myArrayPath = allImgFromDynamo.Item!.object.SS;
    log(myArrayPath);
    if (myArrayPath === undefined) myArrayPath = [];
    const total = Math.ceil(Number(myArrayPath.length) / limit);
    const skip = Number((pageNumber - 1) * limit);
    let limitCounter = 0;
    let result = [];
    for (let i = skip; limitCounter < limit && i < myArrayPath.length; i++) {
      limitCounter++;
      result.push(myArrayPath[i]);
    }
    log(result);
    return { result: result, total: total };
  }

  async getImageForTotal__ForFilterAll(userIdFromRequest: string) {
    const imgForTotal = await imageModel
      .find({
        $or: [{ userId: userIdFromRequest }, { userId: '615aae0509d876c365438bf0' }],
      })
      .lean();

    return imgForTotal;
  }

  async getImageForTotal__ForFilterMyImage(userIdFromRequest: string) {
    const imgForTotal = await imageModel.find({ userId: userIdFromRequest }).lean();
    log('imgForTotal=' + imgForTotal);
    return imgForTotal;
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
    return userIdFromToken.S;
  }

  async saveImgInDb(event, parseEvent): Promise<void> {
    const connectToMongo = connect();
    console.log(connectToMongo);
    const userId = await this.getUserIdFromToken(event);
    const image = new imageModel({
      path: `/img/` + parseEvent.img.filename,
      metadata: await this.fileMetadata(
        `/Users/pm/Desktop/Astra/projects/module3/part1/sls/flo.sls/img/` + parseEvent.img.filename
      ),
      userId: userId,
    });

    const result = this.customInsertOne(image);

    if (result) {
      console.log('img was add');
    } else {
      console.log('img exist');
    }
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

  trySaveToDir(imageName: string, Image: Buffer): void {
    fs.writeFile(
      `/Users/pm/Desktop/Astra/projects/module3/part1/sls/flo.sls/img/${imageName}`,
      Image,
      { flag: 'wx' },
      (err) => {
        if (err) {
          log(err);
          baseErrorHandler(err);
        }
      }
    );
  }

  trySaveToMongoDb(event: any, parseEvent: any): void {
    try {
      this.saveImgInDb(event, parseEvent);
    } catch (err) {
      log(err);
      throw new Error('fail trySaveToMongoDb');
    }
  }
}
