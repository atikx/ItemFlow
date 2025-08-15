import { gql } from "@apollo/client";

export const GET_ITEM_LOGS = gql`
  query ItemLogs($eventId: ID!) {
    itemLogs(eventId: $eventId) {
      id
      itemId
      eventId
      issuedBy
      phone
      departmentId
      eventId
      expectedReturnDate
      quantityIssued
      returnedAt
      returnedBy
    }
  }
`;

export const CREATE_ITEM_LOG = gql`
  mutation CreateItemLog($createItemLogInput: CreateItemLogInput!) {
    createItemLog(createItemLogInput: $createItemLogInput) {
      id
      itemId
      eventId
      phone
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
      phone
      departmentId
      eventId
      expectedReturnDate
      quantityIssued
    }
  }
`;

export const RETURN_ITEM_LOG = gql`
  mutation ReturnItemLog($returnItemLogInput: ReturnItemLogInput!) {
  returnItemLog(returnItemLogInput: $returnItemLogInput)
}
`;
