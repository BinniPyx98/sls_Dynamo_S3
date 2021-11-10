import { getEnv } from '@helper/environment';
import { S3 } from 'aws-sdk';
import { log } from '@helper/logger';

import {
  DeleteObjectOutput,
  DeleteObjectRequest,
  GetObjectOutput,
  GetObjectRequest,
  PutObjectOutput,
  PutObjectRequest,
} from 'aws-sdk/clients/s3';

export class S3Service {
  public s3 = new S3({
    signatureVersion: 'v4',
    region: getEnv('REGION'),
  });

  public getPreSignedPutUrl(key: string, bucket: string, acl = 'public-read-write'): string {
    const params = {
      ACL: acl,
      Bucket: bucket,
      Key: key,
    };
    return this.s3.getSignedUrl('putObject', params);
  }

  public getPreSignedGetUrl(key: string, bucket: string): string {
    const params = {
      Bucket: bucket,
      Key: key,
    };
    return this.s3.getSignedUrl('getObject', params);
  }

  public remove(key: string, bucket: string): Promise<DeleteObjectOutput> {
    const params: DeleteObjectRequest = {
      Bucket: bucket,
      Key: key,
    };
    return this.s3.deleteObject(params).promise();
  }

  public put(key: string, body: Buffer, bucket: string, type: string, acl = 'public-read'): Promise<PutObjectOutput> {
    const params: PutObjectRequest = {
      ACL: acl,
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: type,
    };
    return this.s3.putObject(params).promise();
  }

  public get(key: string, bucket: string): Promise<GetObjectOutput> {
    const params: GetObjectRequest = {
      Bucket: bucket,
      Key: key,
    };
    return this.s3.getObject(params).promise();
  }

  public listBuckets() {
    this.s3.listBuckets(function (err, data) {
      if (err) {
        log('Error', err);
      } else {
        log('Success', data.Buckets);
      }
    });
  }
}
