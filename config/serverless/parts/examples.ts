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
    // exampleHttpApiDefaultResponse: {
    //   handler: 'api/http-api/handler.defaultResponse',
    //   memorySize: 128,
    //   events: [
    //     {
    //       httpApi: {
    //         path: '/example/http-api/default-response',
    //         method: 'get',
    // //         authorizer: {
    // //           name: 'exampleAuthorizer',
    // //         },
    // //       },
    // //     },
    // //   ],
    // // },
    // exampleHttpApiCustomResponse: {
    //   handler: 'api/http-api/handler.customResponse',
    //   memorySize: 128,
    //   events: [
    //     {
    //       httpApi: {
    //         path: '/example/http-api/custom-response',
    //         method: 'get',
    //       },
    //     },
    //   ],
    // },

    exampleRestApiDefaultResponse: {
      handler: 'api/rest-api/gallery/getGallery.getHandler',
      memorySize: 500,
      events: [
        {
          http: {
            path: '/gallery',
            method: 'get',
            integration: 'lambda',
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
    // exampleRestApiDefaultResponse: {
    //   handler: 'api/rest-api/handler.postImageHandler',
    //   memorySize: 128,
    //   events: [
    //     {
    //       http: {
    //         path: '/gallery',
    //         method: 'post',
    //         integration: 'lambda',
    //         cors: true,
    //         authorizer: {
    //           name: 'exampleAuthorizerRestApi',
    //         },
    //         response: {
    //           headers: {
    //             'Access-Control-Allow-Origin': "'*'",
    //             'Content-Type': "'application/json'",
    //           },
    //           template: "$input.json('$')",
    //         },
    //       },
    //     },
    //   ],
    // },
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
