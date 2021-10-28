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
            Action: [
              'dynamodb:Query',
              'dynamodb:Scan',
              'dynamodb:GetItem',
              'dynamodb:PutItem',
              'dynamodb:DeleteItem',
              'dynamodb:UpdateItem',
              'dynamodb:CreateTable',
              'dynamodb:DescribeTable',
            ],
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
          ],
          // ProvisionedThroughput: {
          //   ReadCapacityUnits: 4,
          //   WriteCapacityUnits: 2,
          // },
          KeySchema: [
            {
              AttributeName: 'email',
              KeyType: 'HASH',
            },
          ],
          BillingMode: 'PAY_PER_REQUEST',
          TableName: '${self:custom.tablesNames.GalleryTable.${self:provider.stage}}',
          StreamSpecification: {
            StreamViewType: 'NEW_AND_OLD_IMAGES',
          },
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
        prod: 'Kalinichecko-prod-Gallery',
      },
    },
  },
};
