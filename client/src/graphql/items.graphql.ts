import { gql } from "@apollo/client";

export const GET_ITEMS = gql`
  query Items {
    items {
      id
      name
      quantityTotal
      quantityAvailable
    }
  }
`;

export const CREATE_ITEM = gql`
  mutation Mutation($createItemInput: CreateItemInput!) {
    createItem(createItemInput: $createItemInput) {
      id
      name
      quantityTotal
      quantityAvailable
    }
  }
`;

export const UPDATE_ITEM = gql`
  mutation Mutation($updateItemInput: UpdateItemInput!) {
    updateItem(updateItemInput: $updateItemInput) {
      id
      name
      quantityTotal
      quantityAvailable
    }
  }
`;

export const DELETE_ITEM = gql`
 mutation Mutation($removeItemId: ID!) {
  removeItem(id: $removeItemId)
}
`;