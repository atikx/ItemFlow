import { gql } from "@apollo/client";

export const GET_EVENTS = gql`
  query Events {
    events {
      id
      name
      year
    }
  }
`;

export const CREATE_EVENT = gql`
  mutation CreateEvent($createEventInput: CreateEventInput!) {
    createEvent(createEventInput: $createEventInput) {
      id
      name
      year
    }
  }
`;

export const DELETE_EVENT = gql`
  mutation CreateEvent($removeEventId: ID!) {
    removeEvent(id: $removeEventId)
  }
`;
