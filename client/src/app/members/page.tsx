"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, Loader2 } from "lucide-react";
import { useMembers } from "@/hooks/useMembers";
import { AddMemberDialog } from "./AddMemberDialog";
import { MemberTable } from "./MemberTable";

export default function MembersPage() {
  const {
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
  } = useMembers();

  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-muted-foreground">Loading members...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-destructive mb-4">
              Error loading members: {error.message}
            </p>
            <Button onClick={() => refetch()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Users className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Organization Members</h1>
        </div>
        <p className="text-muted-foreground">
          Manage your organization members - add, edit, or remove members as
          needed. Members are organized by batch year.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Members List
              </CardTitle>
              <CardDescription>Total members: {members.length}</CardDescription>
            </div>
            <AddMemberDialog onAddMember={addMember} isLoading={isAddLoading} />
          </div>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No members found. Add your first member to get started.
              </p>
            </div>
          ) : (
            <MemberTable
              groupedMembers={groupedMembers}
              sortedBatches={sortedBatches}
              onUpdateMember={updateMember}
              onDeleteMember={deleteMember}
              isEditLoading={isEditLoading}
              deletingMemberId={deletingMemberId}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
