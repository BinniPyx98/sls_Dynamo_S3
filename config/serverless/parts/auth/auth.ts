import { AWSPartitial } from '../../types';

export const authorizationConfig: AWSPartitial = {
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
