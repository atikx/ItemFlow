import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LocalMember } from "@/types/member.types";
import { EditMemberDialog } from "./EditMemberDialog";
import { DeleteMemberDialog } from "./DeleteMemberDialog";

interface MemberTableProps {
  groupedMembers: Record<number, LocalMember[]>;
  sortedBatches: number[];
  onUpdateMember: (memberId: string, formData: any) => Promise<boolean>;
  onDeleteMember: (id: string) => Promise<boolean>;
  isEditLoading: boolean;
  deletingMemberId: string | null;
}

export const MemberTable = ({
  groupedMembers,
  sortedBatches,
  onUpdateMember,
  onDeleteMember,
  isEditLoading,
  deletingMemberId,
}: MemberTableProps) => {
  return (
    <div className="space-y-8">
      {sortedBatches.map((batch) => (
        <div key={batch}>
          <div className="flex items-center gap-3 mb-4 pb-2 border-b">
            <h3 className="text-xl font-semibold">{batch} Batch</h3>
            <Badge variant="outline" className="text-sm">
              {groupedMembers[batch].length} members
            </Badge>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50%]">Name</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupedMembers[batch].map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <EditMemberDialog
                          member={member}
                          onUpdateMember={onUpdateMember}
                          isLoading={isEditLoading}
                        />
                        <DeleteMemberDialog
                          member={member}
                          onDeleteMember={onDeleteMember}
                          isDeleting={deletingMemberId === member.id}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ))}
    </div>
  );
};
