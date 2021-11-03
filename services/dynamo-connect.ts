import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { getEnv } from '@helper/environment';

const REGION = 'us-east-1'; //e.g. "us-east-1"
export const dynamoClient = new DynamoDBClient({
  region: getEnv('REGION'),
});
