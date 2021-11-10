import { AWSPartitial } from '../../types';

export const galleryConfig: AWSPartitial = {
  provider: {
    environment: {
      GALLERY_TABLE_NAME: '${self:custom.tablesNames.GalleryTable.${self:provider.stage}}',
    },
    iam: {
      role: {
        statements: [
          {
            Effect: 'Allow',
            Action: ['dynamodb:*'],
            Resource: [
              'arn:aws:dynamodb:*:*:table/${file(env.yml):${self:provider.stage}.GALLERY_TABLE_NAME}',
              'arn:aws:dynamodb:*:*:table/${file(env.yml):${self:provider.stage}.GALLERY_TABLE_NAME}/index/*',
            ],
          },
        ],
      },
    },
  },
  resources: {
    Resources: {
      GalleryTable: {
        Type: 'AWS::DynamoDB::Table',
        DeletionPolicy: 'Retain',
        Properties: {
          AttributeDefinitions: [
            {
              AttributeName: 'email',
              AttributeType: 'S',
            },
            {
              AttributeName: 'imageName',
              AttributeType: 'S',
            },
            {
              AttributeName: 'Hash',
              AttributeType: 'S',
            },
            {
              AttributeName: 'status',
              AttributeType: 'S',
            },
          ],
          KeySchema: [
            {
              AttributeName: 'email',
              KeyType: 'HASH',
            },
            {
              AttributeName: 'Hash',
              KeyType: 'RANGE',
            },
          ],
          GlobalSecondaryIndexes: [
            {
              IndexName: 'FindImageIndex',
              KeySchema: [
                {
                  AttributeName: 'imageName',
                  KeyType: 'HASH',
                },
                {
                  AttributeName: 'status',
                  KeyType: 'RANGE',
                },
              ],
              Projection: {
                ProjectionType: 'ALL',
              },
            },
          ],
          BillingMode: 'PAY_PER_REQUEST',
          TableName: '${self:custom.tablesNames.GalleryTable.${self:provider.stage}}',
        },
      },
    },
  },
  custom: {
    tablesNames: {
      GalleryTable: {
        local: 'Kalinichecko-local-Gallery',
        dev: 'Kalinichecko-dev-Gallery',
        test: 'Kalinichecko-test-Gallery',
        prod: 'kalinichecko-prod-gallery',
      },
    },
  },
};
