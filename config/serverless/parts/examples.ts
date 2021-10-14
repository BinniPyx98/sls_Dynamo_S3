import { AWSPartitial } from '../types';

export const examplesConfig: AWSPartitial = {
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
    getGallery: {
      handler: 'api/rest-api/gallery/getGallery.getHandler',
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
    imageUpload: {
      handler: 'api/rest-api/gallery/postImageHandler.postImageHandler',
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
    auth: {
      handler: 'api/rest-api/auth.authorization',
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
      handler: 'api/rest-api/registration.registration',
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
    exampleAuthorizerRestApi: {
      handler: 'api/auth/handler.restApi',
      memorySize: 128,
    },
  },
};
