// lib/apollo-client.ts
import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT, // e.g., http://localhost:3000/graphql
  cache: new InMemoryCache(),
  credentials: 'include', // optional: for cookies/sessions
});

export default client;
