import { gql } from "@apollo/client";

export const GET_INDUCTION_QUANTITIES = gql`
  query InductionQuantities {
    inductionQuantities {
      id
      name
      weightage
    }
  }
`;

export const CREATE_INDUCTION_QUANTITY = gql`
  mutation Mutation(
    $createInductionQuantityInput: CreateInductionQuantityInput!
  ) {
    createInductionQuantity(
      createInductionQuantityInput: $createInductionQuantityInput
    ) {
      name
      weightage
    }
  }
`;

export const UPDATE_INDUCTION_QUANTITY = gql`
  mutation Mutation(
    $updateInductionQuantityInput: UpdateInductionQuantityInput!
  ) {
    updateInductionQuantity(
      updateInductionQuantityInput: $updateInductionQuantityInput
    ) {
      id
      name
      weightage
    }
  }
`;

export const DELETE_INDUCTION_QUANTITY = gql`
  mutation Mutation($removeInductionQuantityId: ID!) {
    removeInductionQuantity(id: $removeInductionQuantityId)
  }
`;
