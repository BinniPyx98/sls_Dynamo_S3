import { AWSPartitial } from '../../types';

export const getGalleryConfig: AWSPartitial = {
  provider: {
    environment: {},
    iam: {
      role: {
        statements: [
          //       {
          //         Effect: 'Allow',
          //         Action: [
          //           'dynamodb:Query',
          //           'dynamodb:Scan',
          //           'dynamodb:GetItem',
          //           'dynamodb:PutItem',
          //           'dynamodb:DeleteItem',
          //           'dynamodb:UpdateItem',
          //           'dynamodb:CreateTable',
          //         ],
          //         Resource: [
          //           'arn:aws:dynamodb:*:*:table/${file(env.yml):${self:provider.stage}.JOBS_TABLE_NAME}',
          //           'arn:aws:dynamodb:*:*:table/${file(env.yml):${self:provider.stage}.JOBS_TABLE_NAME}/index/*',
          //         ],
          //       },
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
                'Access-Control-Allow-Origin': '\'*\'',
                'Content-Type': '\'application/json\'',
              },
              template: '$input.json(\'$\')',
            },
          },
        },
      ],
    },
    imageUpload: {
      handler: 'api/gallery/handler.postImageHandler',
      memorySize: 128,
      events: [
        {
          http: {
            path: '/upload',
            method: 'post',
            integration: 'lambda-proxy',
            cors: true,
            authorizer: {
              name: 'AuthorizerCheckToken',
            },
            response: {
              headers: {
                'Access-Control-Allow-Origin': '\'*\'',
                'Content-Type': '\'application/json\'',
              },
              template: '$input.json(\'$\')',
            },
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
