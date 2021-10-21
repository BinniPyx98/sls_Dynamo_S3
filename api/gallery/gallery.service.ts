import { baseErrorHandler } from '@helper/base-error-handler';
import { getEnv } from '@helper/environment';
import { log } from '@helper/logger';
import { imageModel } from '@models/MongoDB/ImageSchema';
import connect from '@services/mongo-connect';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as jwt from 'jsonwebtoken';
import { GalleryObject } from './gallery.inteface';

export class GalleryService {
  async checkFilterAndFindInDb(event) {
    const connectToMongo = connect();
    const pageNumber = Number(event.queryStringParameters.page);
    const limit = Number(event.queryStringParameters.limit);
    const userIdFromRequest = await this.getUserIdFromToken(event);
    let result;
    let img;

    if (event.queryStringParameters.filter === 'All') {
      img = await this.getImageForTotal__ForFilterAll(userIdFromRequest);
      result = await this.getImageForResponse__ForFilterAll(userIdFromRequest, pageNumber, limit);
    } else {
      img = await this.getImageForTotal__ForFilterMyImage(userIdFromRequest);
      result = await this.getImageForResponse__ForFilterMyImage(userIdFromRequest, pageNumber, limit);
    }
    return { result: result, img: img };
  }

  async getImageForResponse__ForFilterAll(userIdFromRequest: string, pageNumber: number, limit: number) {
    const imageFromDb = await imageModel
      .find({
        $or: [{ userId: userIdFromRequest }, { userId: '615aae0509d876c365438bf0' }],
      })
      .lean()
      .skip(Number((pageNumber - 1) * limit))
      .limit(limit);

    return imageFromDb;
  }

  async getImageForResponse__ForFilterMyImage(userIdFromRequest: string, pageNumber: number, limit: number) {
    console.log('userIdFromRequest' + userIdFromRequest);
    const imageFromDb = await imageModel
      .find({ userId: userIdFromRequest })
      .lean()
      .skip(Number((pageNumber - 1) * limit))
      .limit(limit);

    return imageFromDb;
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
    const imagePathArray: Array<string> = []; //img path array

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
  }

  async getUserIdFromToken(event): Promise<string> {
    const tokenKey = getEnv('TOKEN_KEY');
    let userIdFromToken;
    const bearerHeader = event.authorizationToken;

    if (event.authorizationToken) {
      const bearer = bearerHeader.split(' ');
      const bearerToken = bearer[1];

      jwt.verify(bearerToken, tokenKey, function (err, decoded) {
        userIdFromToken = decoded.id;
      });
    }

    return userIdFromToken;
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
