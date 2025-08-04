import { gql } from "@apollo/client";

export const GET_INDUCTION_CONTESTANTS = gql`
  query InductionContestants {
    inductionContestants {
      id
      name
      email
      finalScore
    }
  }
`;

export const CREATE_INDUCTION_CONTESTANT = gql`
  mutation CreateInductionContestant(
    $createInductionContestantInput: CreateInductionContestantInput!
  ) {
    createInductionContestant(
      createInductionContestantInput: $createInductionContestantInput
    ) {
      id
      name
      email
    }
  }
`;

export const UPDATE_INDUCTION_CONTESTANT = gql`
  mutation UpdateInductionContestant(
    $updateInductionContestantInput: UpdateInductionContestantInput!
  ) {
    updateInductionContestant(
      updateInductionContestantInput: $updateInductionContestantInput
    ) {
      id
      name
      email
      finalScore
    }
  }
`;

export const DELETE_INDUCTION_CONTESTANT = gql`
  mutation UpdateInductionContestant($removeInductionContestantId: ID!) {
    removeInductionContestant(id: $removeInductionContestantId)
  }
`;

export const GET_INDUCTION_CONTESTANT_EVALUATIONS = gql`
  query GetContestantEvaluationData($getContestantEvaluationDataId: ID!) {
    getContestantEvaluationData(id: $getContestantEvaluationDataId) {
      id
      name
      email
      finalScore
      evaluations {
        id
        score
        quality {
          id
          name
          weightage
        }
      }
    }
  }
`;


export const EVALUATE_INDUCTION_CONTESTANT = gql`
  mutation EvaluateContestant($evaluateContestantInput: InductionEvaluationInput!) {
  evaluateContestant(evaluateContestantInput: $evaluateContestantInput) {
    finalScore
    email
    name
    id
  }
}
`;