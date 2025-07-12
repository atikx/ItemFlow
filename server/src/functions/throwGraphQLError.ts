import { ApolloError } from 'apollo-server-express';

export function throwGraphQLError(
  message: string,
  code: string = 'BAD_REQUEST',
  statusCode: number = 400
) {
  throw new ApolloError(message, code, { statusCode });
}