import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

const REGION = 'us-east-1'; //e.g. "us-east-1"
export const dynamoClient = new DynamoDBClient({ region: REGION });
