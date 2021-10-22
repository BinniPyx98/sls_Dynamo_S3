import { log } from '@helper/logger';
import { APIGatewayLambdaEvent } from '@interfaces/api-gateway-lambda.interface';
//import connect from '@services/mongo-connect';
import { APIGatewayTokenAuthorizerWithContextHandler, Handler } from 'aws-lambda';
import { RegistrationResponse, UserAuthData } from './auth.inteface';
import { AuthManager } from './auth.manager';

export const authorizer: APIGatewayTokenAuthorizerWithContextHandler<Record<string, any>> = async (event) => {
  log(event);
  const manager = new AuthManager();
  //connect();
  return await manager.generatePolicy(event, 'user', 'Allow', '*', {});
};
export const registration: Handler<APIGatewayLambdaEvent<RegistrationResponse>, any> = async (event) => {
  log(event);
  const manager = new AuthManager();
  const authData = event.body;
  return await manager.tryRegistration(authData!);
};
export const authorization: Handler<APIGatewayLambdaEvent<string>, any> = async (event) => {
  log(event);
  const manager = new AuthManager();
  const authData: UserAuthData = event.body;
  const authResult = await manager.checkAuthData(authData);
  if (authResult.error) {
    throw new Error('Unauthorized');
  } else {
    return authResult.data;
  }
};
