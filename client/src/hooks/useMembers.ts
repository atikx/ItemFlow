import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { toast } from "sonner";
import { GET_MEMBERS } from "@/graphql/members.graphql";
import {
  ADD_MEMBER,
  UPDATE_MEMBER,
  DELETE_MEMBER,
} from "@/graphql/members.graphql";
import {
  LocalMember,
  MemberFormData,
  CreateMemberInput,
  UpdateMemberInput,
} from "@/types/members.types";

export const useMembers = () => {
  const [members, setMembers] = useState<LocalMember[]>([]);
  const [isAddLoading, setIsAddLoading] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);

  const { data, loading, error, refetch } = useQuery(GET_MEMBERS);

  const [addMemberMutation] = useMutation(ADD_MEMBER, {
    refetchQueries: [{ query: GET_MEMBERS }],
  });

  const [updateMemberMutation] = useMutation(UPDATE_MEMBER, {
    refetchQueries: [{ query: GET_MEMBERS }],
  });

  const [deleteMemberMutation] = useMutation(DELETE_MEMBER, {
    refetchQueries: [{ query: GET_MEMBERS }],
  });

  // Update local state when GraphQL data changes and sort by batch
  useEffect(() => {
    if (data?.members) {
      const sortedMembers = data.members
        .map((member: any) => ({ ...member }))
        .sort((a: LocalMember, b: LocalMember) => b.batch - a.batch);
      setMembers(sortedMembers);
    }
  }, [data]);

  const addMember = async (formData: MemberFormData) => {
    if (!formData.name?.trim() || !formData.batch?.trim()) {
      toast.error("Please fill in all fields");
      return false;
    }

    setIsAddLoading(true);
    try {
      const res = await addMemberMutation({
        variables: {
          createMemberInput: {
            name: formData.name.trim(),
            batch: parseInt(formData.batch),
          } as CreateMemberInput,
        },
      });

      toast.success("Member added successfully!");
      console.log("Member created:", res.data.createMember);
      return true;
    } catch (error: any) {
      console.error("Error adding member:", error);
      const errorMessage =
        error?.message || "Failed to add member. Please try again.";
      toast.error(errorMessage);
      return false;
    } finally {
      setIsAddLoading(false);
    }
  };

  const updateMember = async (memberId: string, formData: MemberFormData) => {
    if (!formData.name?.trim() || !formData.batch?.trim()) {
      toast.error("Please fill in all fields");
      return false;
    }

    setIsEditLoading(true);
    try {
      const res = await updateMemberMutation({
        variables: {
          updateMemberInput: {
            id: memberId,
            name: formData.name.trim(),
            batch: parseInt(formData.batch),
          } as UpdateMemberInput,
        },
      });

      toast.success("Member updated successfully!");
      console.log("Member updated:", res.data.updateMember);
      return true;
    } catch (error: any) {
      console.error("Error updating member:", error);
      const errorMessage =
        error?.message || "Failed to update member. Please try again.";
      toast.error(errorMessage);
      return false;
    } finally {
      setIsEditLoading(false);
    }
  };

  const deleteMember = async (id: string) => {
    setDeletingMemberId(id);
    try {
      await deleteMemberMutation({
        variables: { removeMemberId: id },
      });
      toast.success("Member deleted successfully!");
      return true;
    } catch (error: any) {
      console.error("Error deleting member:", error);
      const errorMessage =
        error?.message || "Failed to delete member. Please try again.";
      toast.error(errorMessage);
      return false;
    } finally {
      setDeletingMemberId(null);
    }
  };

  // Group members by batch
  const groupedMembers = members.reduce((groups, member) => {
    const batch = member.batch;
    if (!groups[batch]) {
      groups[batch] = [];
    }
    groups[batch].push(member);
    return groups;
  }, {} as Record<number, LocalMember[]>);

  const sortedBatches = Object.keys(groupedMembers)
    .map(Number)
    .sort((a, b) => b - a);

  return {
    members,
    groupedMembers,
    sortedBatches,
    loading,
    error,
    refetch,
    addMember,
    updateMember,
    deleteMember,
    isAddLoading,
    isEditLoading,
    deletingMemberId,
  };
};
