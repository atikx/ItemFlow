import { gql } from "@apollo/client";

export const GET_ITEM_LOGS = gql`
  query ItemLogs($eventId: ID!) {
    itemLogs(eventId: $eventId) {
      id
      itemId
      eventId
      issuedBy
      departmentId
      eventId
      expectedReturnDate
      quantityIssued
      returnedAt
    }
  }
`;

export const CREATE_ITEM_LOG = gql`
  mutation CreateItemLog($createItemLogInput: CreateItemLogInput!) {
    createItemLog(createItemLogInput: $createItemLogInput) {
      id
      itemId
      eventId
      issuedBy
      departmentId
      eventId
      expectedReturnDate
      quantityIssued
    }
  }
`;

export const UPDATE_ITEM_LOG = gql`
  mutation CreateItemLog($updateItemLogInput: UpdateItemLogInput!) {
    updateItemLog(updateItemLogInput: $updateItemLogInput) {
      id
      itemId
      eventId
      issuedBy
      departmentId
      eventId
      expectedReturnDate
      quantityIssued
    }
  }
`;

export const RETURN_ITEM_LOG = gql`
  mutation ReturnItemLog($returnItemLogId: ID!) {
    returnItemLog(id: $returnItemLogId)
  }
`;
