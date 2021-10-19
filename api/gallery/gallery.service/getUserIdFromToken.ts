import { getEnv } from '@helper/environment';
import * as jwt from 'jsonwebtoken';

export async function getUserIdFromToken(event) {
  const tokenKey = getEnv('TOKEN_KEY');
  let userIdFromToken;
  const bearerHeader = event.authorizationToken;

  if (event.authorizationToken) {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];

    jwt.verify(bearerToken, tokenKey, function (err, decoded) {
      console.log(decoded);
      userIdFromToken = decoded.id;
    });
  }

  return userIdFromToken;
}
