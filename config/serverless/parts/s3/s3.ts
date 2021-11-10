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
            Action: ['s3:*'],
            Resource: [
              'arn:aws:dynamodb:*:*:table/${file(env.yml):${self:provider.stage}.S3_NAME}',
              'arn:aws:dynamodb:*:*:table/${file(env.yml):${self:provider.stage}.S3_NAME}/*',
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
        Properties: {
          BucketName: '${self:custom.S3Names.S3Bucket.${self:provider.stage}}',
          AccessControl: 'PublicReadWrite',
          CorsConfiguration: {
            CorsRules: [
              {
                AllowedHeaders: ['*'],
                AllowedMethods: ['PUT', 'POST', 'DELETE', 'GET'],
                AllowedOrigins: ['*'],
              },
            ],
          },
        },
      },
    },
  },
  custom: {
    S3Names: {
      S3Bucket: {
        local: 'kalinichecko-local-s3bucket',
        dev: 'kalinichecko-dev-s3bucket',
        test: 'kalinichecko-test-S3bucket',
        prod: 'kalinichecko-prod-s3bucket',
      },
    },
  },
};
