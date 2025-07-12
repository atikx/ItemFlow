export interface Member {
  __typename?: string;
  id: string;
  name: string;
  batch: number;
}

export interface LocalMember extends Member {
  id: string;
}

export interface MemberFormData {
  name: string;
  batch: string;
}

export interface CreateMemberInput {
  name: string;
  batch: number;
}

export interface UpdateMemberInput {
  id: string;
  name: string;
  batch: number;
}
