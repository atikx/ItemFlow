"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu, Loader2 } from "lucide-react"; // Added Loader2 for spinner
import { useState } from "react";
import { SidebarTrigger } from "./ui/sidebar";
import { useConfirm } from "@/hooks/useConfirm";
import client from "@/lib/apollo-client";

const navLinks = [
  { name: "Home", href: "/home" },
  { name: "Items", href: "/items" },
  { name: "Events", href: "/events" },
  { name: "Departments", href: "/departments" },
  { name: "members", href: "/members" },
];

import { useAuthStore } from "@/lib/store";
import { gql, useMutation } from "@apollo/client";
import { toast } from "sonner";

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { confirm, ConfirmDialog } = useConfirm();
  const { clearUser } = useAuthStore();
  const router = useRouter();

  const LOGOUT_MUTATION = gql`
    mutation Logout {
      logout
    }
  `;

  const [logoutMutation, { loading, error }] = useMutation(LOGOUT_MUTATION);

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

  if (pathname.startsWith("/auth")) {
    return null; // Don't render navbar on auth pages
  }

  return (
    <header className="w-full border-b bg-background">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <SidebarTrigger />

        {/* Desktop Nav */}
        <nav className="hidden gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === link.href
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={loading} // Disable button during loading
            onClick={() => {
              confirm({
                title: "Log out",
                description: "Are you sure you want to log out?",
                onConfirm: handleLogout,
              });
            }}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Logging out..." : "Logout"}
          </Button>
          {ConfirmDialog}
          {/* Hamburger for mobile */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden ml-2"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <nav className="flex flex-col gap-2 px-4 py-2 md:hidden border-t bg-background">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium py-1",
                pathname === link.href
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
              onClick={() => setMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
