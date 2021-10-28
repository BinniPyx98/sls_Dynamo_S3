import { GetItemCommand } from '@aws-sdk/client-dynamodb';
import { dynamoClient } from '@services/dynamo-connect';
import { APIGatewayAuthorizerResult, APIGatewayTokenAuthorizerEvent } from 'aws-lambda';
import { UserAuthData, UserPresenceInDb } from './auth.inteface';
import { AuthService } from './auth.service';

/**
 * It's the feature manager
 * Its methods should implement some feature's functionality
 */
export class AuthManager {
  private readonly service: AuthService;

  constructor() {
    /**
     * The feature service should be created in the constructor of the feature manager
     * Other services should be provided in the feature manager's methods
     */
    this.service = new AuthService();
  }

  // /**
  //  * This method implements some feature's functionality
  //  * It should validate required data
  //  * It should display the main steps of the algorithm without implementation
  //  * All implementation should be placed in the feature service's methods
  //  * @param mediaInfoUrl - required data
  //  * @param mediaInfoCurlService - required services
  //  */
  async tryRegistration(authData: UserAuthData): Promise<{ statusCode?: number; body: string }> {
    const userExist = await this.service.checkUserInDb(authData);

    if (userExist) {
      return {
        statusCode: 415,
        body: JSON.stringify({
          message: 'This email address is already in use.',
        }),
      };
    } else {
      const newUser = this.service.createNewUser(authData);
      this.service.addUserInDb(newUser);
      return {
        body: JSON.stringify({
          message: 'success registration',
        }),
      };
    }
  }

  getUserIdFromToken(event: APIGatewayTokenAuthorizerEvent): Promise<string> {
    return this.service.getUserIdFromToken(event);
  }

  async generatePolicy<C extends APIGatewayAuthorizerResult['context']>(
    event: APIGatewayTokenAuthorizerEvent,
    user: string,
    access: 'Allow' | 'Deny',
    resource: string,
    context: C
  ): Promise<APIGatewayAuthorizerResult & { context: C }> {
    const userIDFromRequest = await this.service.getUserIdFromToken(event);
    const UNAUTHORIZED = new Error('Unauthorized');

    if (event.authorizationToken === 'error') {
      throw new Error('Internal server error');
    }
    if (!event.authorizationToken) {
      throw UNAUTHORIZED;
    }
    if (event.authorizationToken) {
      const params = {
        TableName: 'Gallery',
        Key: {
          email: { S: userIDFromRequest },
        },
      };
      const existUserInDb = await dynamoClient.send(new GetItemCommand(params));
      if (!existUserInDb) {
        throw UNAUTHORIZED;
      }
    }
    return this.service.generatePolicy(user, access, resource, context);
  }

  async checkAuthData(authData: UserAuthData): Promise<UserPresenceInDb> {
    return await this.service.checkAuthData(authData);
  }
}
