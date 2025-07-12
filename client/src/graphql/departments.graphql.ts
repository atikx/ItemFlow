import { gql } from "@apollo/client";

export const GET_DEPARTMENTS = gql`
  query Departments {
    departments {
      id
      name
      email
    }
  }
`;

export const CREATE_DEPARTMENT = gql`
  mutation CreateDepartment($createDepartmentInput: CreateDepartmentInput!) {
    createDepartment(createDepartmentInput: $createDepartmentInput) {
      id
      name
      email
    }
  }
`;

export const REMOVE_DEPARTMENT = gql`
  mutation RemoveDepartment($removeDepartmentId: ID!) {
    removeDepartment(id: $removeDepartmentId)
  }
`;
