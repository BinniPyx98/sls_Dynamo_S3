import { PutObjectOutput } from 'aws-sdk/clients/s3';
import { GalleryService } from './gallery.service';

/**
 * It's the feature manager
 * Its methods should implement some feature's functionality
 */
export class GalleryManager {
  private readonly service: GalleryService;

  constructor() {
    /**
     * The feature service should be created in the constructor of the feature manager
     * Other services should be provided in the feature manager's methods
     */
    this.service = new GalleryService();
  }

  /**
   * This method implements some feature's functionality
   * It should validate required data
   * It should display the main steps of the algorithm without implementation
   * All implementation should be placed in the feature service's methods
   * @param mediaInfoUrl - required data
   * @param mediaInfoCurlService - required services
   */

  checkFilterAndFindInDb(event) {
    return this.service.checkFilterAndFindInDb(event);
  }
  async createGalleryObject(event, dbResult) {
    return await this.service.createGalleryObject(event, dbResult);
  }
  async trySaveToS3(parseEvent): Promise<PutObjectOutput> {
    return await this.service.trySaveToS3(parseEvent);
  }
  trySaveToMongoDb(event, parseEvent, s3Url) {
    return this.service.trySaveToMongoDb(event, parseEvent, s3Url);
  }
}
