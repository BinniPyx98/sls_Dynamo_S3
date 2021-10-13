import { checkAuthData } from './authData';
import { APIGatewayLambdaEvent } from '@interfaces/api-gateway-lambda.interface';
import { Handler } from 'aws-lambda';
import { checkConnect } from '@services/mongo-connect';
//import { logger } from '@helper/logger';

/*
 * If checkAuthData success, send token to user
 */

export const authorization: Handler<APIGatewayLambdaEvent<null>, any> = async (event) => {
  const connect = checkConnect;
  const authData = event.body;
  const authResult = await checkAuthData(authData);

  console.log(authResult.data);

  if (authResult.error === false) {
    await connect.close();
    return authResult.data;
  } else {
    await connect.close();
    return authResult.data;
  }
};
