import { AWSPartitial } from '../../types';

export const authorizationConfig: AWSPartitial = {
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
    auth: {
      handler: 'api/gallery/authorization/auth.authorization',
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
  },
};
