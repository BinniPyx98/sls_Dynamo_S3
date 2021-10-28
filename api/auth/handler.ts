import { log } from '@helper/logger';
import { APIGatewayLambdaEvent } from '@interfaces/api-gateway-lambda.interface';
import { APIGatewayTokenAuthorizerWithContextHandler, Handler } from 'aws-lambda';
import { RegistrationResponse } from './auth.inteface';
import { AuthManager } from './auth.manager';

export const authorizer: APIGatewayTokenAuthorizerWithContextHandler<Record<string, any>> = async (event) => {
  log(event);
  const manager = new AuthManager();
  return await manager.generatePolicy(event, 'user', 'Allow', '*', {});
};
export const registration: Handler<APIGatewayLambdaEvent<any>, RegistrationResponse> = async (event) => {
  log(event);
  const manager = new AuthManager();
  const authData = event.body;
  return await manager.tryRegistration(authData!);
};
export const authorization: Handler<APIGatewayLambdaEvent<any>, string> = async (event) => {
  log(event);
  const manager = new AuthManager();
  const authData: any = event.body;
  const authResult = await manager.checkAuthData(authData);
  if (authResult.error) {
    throw new Error('Unauthorized');
  } else {
    return authResult.data;
  }
};
