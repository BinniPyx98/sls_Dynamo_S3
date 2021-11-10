import { AWSPartitial } from '../../types';

export const getGalleryConfig: AWSPartitial = {
  provider: {
    environment: {},
    iam: {
      role: {
        statements: [
          // {
          //   Effect: 'Allow',
          //   Action: [
          //     's3:PutObject',
          //     's3:GetObject',
          //     's3:getResourceUrl',
          //     's3:getPreSignedPutUrl',
          //     's3:PutObjectAsl',
          //     's3:CreateBucket',
          //     's3:GetObjectAcl',
          //   ],
          //   Resource: [
          //     'arn:aws:dynamodb:*:*:table/${file(env.yml):${self:provider.stage}.S3_NAME}',
          //     'arn:aws:dynamodb:*:*:table/${file(env.yml):${self:provider.stage}.S3_NAME}/index/*',
          //   ],
          // },
        ],
      },
    },
  },
  functions: {
    getGallery: {
      handler: 'api/gallery/handler.getGallery',
      memorySize: 500,
      events: [
        {
          http: {
            path: '/gallery',
            method: 'get',
            integration: 'lambda-proxy',
            cors: true,
            authorizer: {
              name: 'AuthorizerCheckToken',
            },
            response: {
              headers: {
                'Access-Control-Allow-Origin': "'*'",
                'Content-Type': "'application/json'",
                'Access-Control-Allow-Headers': "'Authorization'",
              },
              template: "$input.json('$')",
            },
          },
        },
      ],
    },
    getS3Url: {
      handler: 'api/gallery/handler.getS3Url',
      memorySize: 128,
      events: [
        {
          http: {
            path: '/getS3Url',
            method: 'post',
            integration: 'lambda-proxy',
            cors: true,
            authorizer: {
              name: 'AuthorizerCheckToken',
            },
            response: {
              headers: {
                'Access-Control-Allow-Origin': "'*'",
                'Content-Type': "'application/json'",
              },
              template: "$input.json('$')",
            },
          },
        },
      ],
    },
    triggerS3Upload: {
      handler: 'api/gallery/handler.triggerS3Upload',
      memorySize: 128,
      events: [
        {
          s3: {
            bucket: 'kalinichecko-prod-s3bucket',
            existing: true,
            event: 's3:ObjectCreated:*',
          },
        },
      ],
    },
    AuthorizerCheckToken: {
      handler: 'api/auth/handler.authorizer',
      memorySize: 128,
    },
  },
};
