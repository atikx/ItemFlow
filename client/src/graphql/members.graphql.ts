import { gql } from "@apollo/client";

export const GET_MEMBERS = gql`
  query Members {
    members {
      id
      name
      batch
    }
  }
`;

export const ADD_MEMBER = gql`
  mutation CreateMember($createMemberInput: CreateMemberInput!) {
    createMember(createMemberInput: $createMemberInput) {
      id
      name
      batch
    }
  }
`;

export const UPDATE_MEMBER = gql`
  mutation UpdateMember($updateMemberInput: UpdateMemberInput!) {
    updateMember(updateMemberInput: $updateMemberInput) {
      id
      name
      batch
    }
  }
`;

export const DELETE_MEMBER = gql`
  mutation RemoveMember($removeMemberId: String!) {
    removeMember(id: $removeMemberId)
  }
`;
