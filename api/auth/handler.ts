import { log } from '@helper/logger';
import { APIGatewayLambdaEvent } from '@interfaces/api-gateway-lambda.interface';
import connect from '@services/mongo-connect';
import { APIGatewayTokenAuthorizerWithContextHandler, Handler } from 'aws-lambda';
import { AuthManager } from './auth.manager';

export const authorizer: APIGatewayTokenAuthorizerWithContextHandler<Record<string, any>> = async (event) => {
  log(event);
  const manager = new AuthManager();
  connect();

  return await manager.generatePolicy(event, 'user', 'Allow', '*', {});
};
export const registration: Handler<APIGatewayLambdaEvent<null>, any> = async (event) => {
  log(event);
  const manager = new AuthManager();
  connect();
  const authData = event.body;
  await manager.tryRegistration(authData!);

  return {
    status: 200,
  };
};
export const authorization: Handler<APIGatewayLambdaEvent<string>, any> = async (event) => {
  log(event);
  const manager = new AuthManager();
  connect();
  const authData = event.body;
  const authResult = await manager.checkAuthData(authData);

  return authResult.data;
};
