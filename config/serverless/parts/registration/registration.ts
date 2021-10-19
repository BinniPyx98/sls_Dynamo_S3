import { AWSPartitial } from '../../types';

export const registrationConfig: AWSPartitial = {
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
    registration: {
      handler: 'api/gallery/registration/registration.registration',
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
