import { log } from '@helper/logger';
import { userModel } from '@models/MongoDB/UsersSchema';
import { checkConnect } from '@services/mongo-connect';
import { APIGatewayAuthorizerResult, APIGatewayTokenAuthorizerWithContextHandler } from 'aws-lambda';
import { getUserIdFromToken } from '../rest-api/getUserIdFromToken';

const UNAUTHORIZED = new Error('Unauthorized');

// REST API authorizer
// See: https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-lambda-authorizer-output.html
export const restApi: APIGatewayTokenAuthorizerWithContextHandler<Record<string, any>> = async (event) => {
  console.log(event);
  const connectDB = await checkConnect;
  log(event);
  const userIDFromRequest = await getUserIdFromToken(event);
  console.log(userIDFromRequest);

  if (event.authorizationToken === 'error') {
    throw new Error('Internal server error');
  }

  if (event.authorizationToken === null) {
    throw UNAUTHORIZED;
  }
  if (event.authorizationToken) {
    const existUserInDb = await userModel.find({ userId: userIDFromRequest });
    if (!existUserInDb) {
      throw UNAUTHORIZED;
    }
  }
  await connectDB.close();
  return generatePolicy('user', 'Allow', '*', {});
};

export function generatePolicy<C extends APIGatewayAuthorizerResult['context']>(
  principalId: string,
  effect: 'Allow' | 'Deny',
  resource: string,
  context: C
): APIGatewayAuthorizerResult & { context: C } {
  const authResponse: APIGatewayAuthorizerResult & { context: C } = {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        },
      ],
    },
    context,
  };

  return authResponse;
}
