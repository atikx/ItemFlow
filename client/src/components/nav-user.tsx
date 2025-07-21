"use client";

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

import { useConfirm } from "@/hooks/useConfirm";
import { useAuthStore } from "@/lib/store";
import { gql, useMutation } from "@apollo/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation"; // ✅ corrected from next/router
import client from "@/lib/apollo-client";

const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

export function NavUser({
  user,
}: {
  user: {
    name: string;
    id: string;
  } | null;
}) {
  if (!user) return null; // ✅ Guard to prevent rendering when no user

  const { isMobile } = useSidebar();
  const { confirm, ConfirmDialog } = useConfirm();
  const { clearUser } = useAuthStore();
  const router = useRouter();

  const [logoutMutation] = useMutation(LOGOUT_MUTATION);

  const handleLogout = async () => {
    try {
      await logoutMutation();
      clearUser();
      toast.success("Logged out successfully!");
      client.resetStore(); // Reset Apollo Client cache
      localStorage.removeItem("eventName"); 
      localStorage.removeItem("eventId"); 
      router.push("/auth/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage
                  src="https://avatars.githubusercontent.com/u/100670938?v=4"
                  alt={user.name}
                />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src="https://avatars.githubusercontent.com/u/100670938?v=4"
                    alt={user.name}
                  />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles />
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => {
                confirm({
                  title: "Log out",
                  description: "Are you sure you want to log out?",
                  onConfirm: handleLogout,
                });
              }}
            >
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {ConfirmDialog}
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
