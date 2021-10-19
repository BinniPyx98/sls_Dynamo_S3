import { checkAuthData } from './authData';
import { APIGatewayLambdaEvent } from '@interfaces/api-gateway-lambda.interface';
import { Handler } from 'aws-lambda';
import connect from '@services/mongo-connect';

/*
 * If checkAuthData success, send token to user
 */

export const authorization: Handler<APIGatewayLambdaEvent<null>, any> = async (event) => {
  const connectToMongo = await connect;
  console.log(connectToMongo);
  const authData = event.body;
  const authResult = await checkAuthData(authData);

  if (authResult.error === false) {
    return authResult.data;
  } else {
    return authResult.data;
  }
};
