import { APIGatewayLambdaEvent } from '@interfaces/api-gateway-lambda.interface';
import { userModel } from '@models/MongoDB/UsersSchema';
import { connect } from '@services/mongo-connect';
import { Handler } from 'aws-lambda';
import * as crypto from 'crypto';
import * as mongoose from 'mongoose';

export const registration: Handler<APIGatewayLambdaEvent<null>, any> = async (event) => {
  const connectToMongo = connect();
  console.log(connectToMongo);
  const authData = event.body;
  const userExist = await checkUserInDb(authData);
  if (userExist) {
    throw 'This email address is already in use.';
  } else {
    const newUser = createNewUser(authData);

    addUserInDb(newUser);
    return {
      status: 200,
    };
  }
};

const createNewUser = (authData) => {
  const [userPasswordFromQuery, userEmailFromQuery] = [authData.password, authData.email];
  const hashPass = crypto.createHash('sha256').update(userPasswordFromQuery).digest('hex');
  const newUser = new userModel({
    _id: new mongoose.mongo.ObjectId(),
    email: userEmailFromQuery,
    password: hashPass,
  });

  return newUser;
};

async function checkUserInDb(authData) {
  const userEmailFromQuery = authData.email;
  const userPresenceInDb = await userModel.findOne({ email: userEmailFromQuery });

  return userPresenceInDb;
}

function addUserInDb(newUser) {
  newUser.save(function (err, DbResult) {
    if (err) {
      throw err;
    }
  });
}
