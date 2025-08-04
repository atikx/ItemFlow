"use client";

import * as React from "react";
import {
  BookOpen,
  Bot,
  Boxes,
  Command,
  Frame,
  Handshake,
  LifeBuoy,
  Map,
  Panda,
  PersonStanding,
  PieChart,
  Send,
  Settings2,
  ShoppingBasket,
  SquareTerminal,
  TicketCheck,
  Users,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavFest } from "@/components/nav-fest";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import { NavInductions } from "./nav-inductions";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import Link from "next/link";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Members",
      url: "members",
      icon: Users,
      isActive: true,
    },
    {
      title: "Items",
      url: "items",
      icon: ShoppingBasket,
    },
    {
      title: "Departments",
      url: "departments",
      icon: Boxes,
    },
    {
      title: "Events",
      url: "events",
      icon: TicketCheck,
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
  fest: [
    {
      name: "Inventory",
      url: "/inventory",
      icon: Frame,
    },
  ],
  inductions: [
    {
      name: "Contestants",
      url: "/inductions/contestants",
      icon: PersonStanding,
    },
    {
      name: "Qualities",
      url: "/inductions/qualities",
      icon: Panda,
    },
    {
      name: "Finalize",
      url: "/inductions/finalize",
      icon: Handshake,
    },
  ],
};

import { useAuthStore } from "@/lib/store";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const path = usePathname();
  if (path.startsWith("/auth")) {
    return null; // Don't render sidebar on auth pages
  }
  const auth  = useAuthStore();
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/home">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">ItemFlow</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavFest projects={data.fest} />
        <NavInductions inductions={data.inductions} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        {auth.user && <NavUser user={auth.user} />}
      </SidebarFooter>
    </Sidebar>
  );
}
