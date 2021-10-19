import { AWSPartitial } from '../../types';

export const imageUploadConfig: AWSPartitial = {
  provider: {
    httpApi: {
      authorizers: {
        exampleAuthorizer: {
          type: 'request',
          enableSimpleResponses: true,
          functionName: 'exampleAuthorizerHttpApi',
          identitySource: '$request.header.Authorization',
        },
      },
    },
  },
  functions: {
    imageUpload: {
      handler: 'api/gallery/uploadImage/postImageHandler.postImageHandler',
      memorySize: 128,
      events: [
        {
          http: {
            path: '/upload',
            method: 'post',
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
