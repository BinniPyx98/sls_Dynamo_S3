import { AWSPartitial } from '../../types';

export const authorizationConfig: AWSPartitial = {
  provider: {
    environment: {},
    iam: {
      role: {
        statements: [
          // {
          //   Effect: 'Allow',
          //   Action: ['dynamodb:*'],
          //   Resource: ['arn:aws:dynamodb:*:*:table/Gallery', 'arn:aws:dynamodb:*:*:table/Gallery/index/*'],
          // },
        ],
      },
    },
  },
  functions: {
    auth: {
      handler: 'api/auth/handler.authorization',
      memorySize: 128,
      events: [
        {
          http: {
            path: '/auth',
            method: 'post',
            integration: 'lambda',
            cors: true,
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
    registration: {
      handler: 'api/auth/handler.registration',
      memorySize: 128,
      events: [
        {
          http: {
            path: '/registration',
            method: 'post',
            integration: 'lambda',
            cors: true,
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
  },
};
