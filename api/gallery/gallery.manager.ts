import { APIGatewayLambdaEvent } from '@interfaces/api-gateway-lambda.interface';
import { DatabaseResult, GetGalleryObject, Metadata } from './gallery.inteface';
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

  // /**
  //  * This method implements some feature's functionality
  //  * It should validate required data
  //  * It should display the main steps of the algorithm without implementation
  //  * All implementation should be placed in the feature service's methods
  //  * @param mediaInfoUrl - required data
  //  * @param mediaInfoCurlService - required services
  //  */

  async checkFilterAndFindInDb(event: APIGatewayLambdaEvent<any>): Promise<DatabaseResult> {
    return await this.service.checkFilterAndFindInDb(event);
  }

  async createGalleryObject(event: APIGatewayLambdaEvent<GetGalleryObject>, dbResult) {
    return await this.service.createGalleryObject(event, dbResult);
  }

  async getUrlForUploadToS3(event, metadata: Metadata): Promise<string> {
    return await this.service.getUrlForUploadToS3(event, metadata);
  }

  saveImgMetadata(event: APIGatewayLambdaEvent<string>, metadata: Metadata) {
    return this.service.saveImgMetadata(event, metadata);
  }
  updateStatus(userEmail, imageTagInS3) {
    return this.service.updateStatus(userEmail, imageTagInS3);
  }
}
