import { AWSPartitial } from '../types';

export const getGalleryConfig: AWSPartitial = {
  provider: {
    iam: {
      role: {
        statements: [
          // {
          //   Effect: 'Allow',
          //   Action: ['s3:*'],
          //   Resource: [
          //     'arn:aws:s3:::${file(env.yml):${self:provider.stage}.BUCKET}',
          //     'arn:aws:s3:::${file(env.yml):${self:provider.stage}.BUCKET}/*',
          //   ],
          // },
          // {
          //   Effect: 'Allow',
          //   Action: ['sqs:DeleteMessage', 'sqs:ReceiveMessage', 'sqs:SendMessage'],
          //   Resource: [GetAtt('SubscribeQueue.Arn')],
          // },
        ],
      },
    },
  },
  functions: {
    getGallery: {
      handler: 'api/gallery/handler.getHandler',
      memorySize: 500,
      events: [
        {
          http: {
            path: '/gallery',
            method: 'get',
            integration: 'lambda-proxy',
            cors: true,
            authorizer: {
              name: 'exampleAuthorizerRestApi',
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
    exampleAuthorizerRestApi: {
      handler: 'api/auth/handler.restApi',
      memorySize: 128,
    },
  },
};
