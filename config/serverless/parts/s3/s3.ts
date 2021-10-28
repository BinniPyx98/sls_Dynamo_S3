import { AWSPartitial } from '../../types';

export const s3Config: AWSPartitial = {
  provider: {
    environment: {
      // GALLERY_TABLE_NAME: '${self:custom.tablesNames.GalleryTable.${self:provider.stage}}',
    },
    iam: {
      role: {
        statements: [
          {
            Effect: 'Allow',
            Action: ['s3:PutObject', 's3:GetObject', 's3:getResourceUrl', 's3:getPreSignedPutUrl'],
            Resource: [
              'arn:aws:dynamodb:*:*:table/${file(env.yml):${self:provider.stage}.S3_NAME}',
              'arn:aws:dynamodb:*:*:table/${file(env.yml):${self:provider.stage}.S3_NAME}/index/*',
            ],
          },
        ],
      },
    },
  },
  resources: {
    Resources: {
      S3: {
        Type: 'AWS::S3::Bucket',
        DeletionPolicy: 'Retain',
        Properties: {
          //"AccelerateConfiguration" : AccelerateConfiguration,
          //"AccessControl" : String,
          //"AnalyticsConfigurations" : [ AnalyticsConfiguration, ... ],
          //"BucketEncryption" : BucketEncryption,
          BucketName: '${self:custom.S3Names.S3Bucket.${self:provider.stage}}',
          // "CorsConfiguration" : CorsConfiguration,
          // "IntelligentTieringConfigurations" : [ IntelligentTieringConfiguration, ... ],
          // "InventoryConfigurations" : [ InventoryConfiguration, ... ],
          // "LifecycleConfiguration" : LifecycleConfiguration,
          // "LoggingConfiguration" : LoggingConfiguration,
          // "MetricsConfigurations" : [ MetricsConfiguration, ... ],
          // "NotificationConfiguration" : NotificationConfiguration,
          // "ObjectLockConfiguration" : ObjectLockConfiguration,
          // "ObjectLockEnabled" : Boolean,
          // "OwnershipControls" : OwnershipControls,
          // "PublicAccessBlockConfiguration" : PublicAccessBlockConfiguration,
          // "ReplicationConfiguration" : ReplicationConfiguration,
          //"Tags" : [ Tag, ... ],
          // "VersioningConfiguration" : VersioningConfiguration,
          // "WebsiteConfiguration" : WebsiteConfiguration
        },
      },
    },
  },
  custom: {
    S3Names: {
      S3Bucket: {
        local: 'Kalinichecko-local-S3Bucket',
        dev: 'Kalinichecko-dev-S3Bucket',
        test: 'Kalinichecko-test-S3Bucket',
        prod: 'Kalinichecko-prod-S3Bucket',
      },
    },
  },
};
