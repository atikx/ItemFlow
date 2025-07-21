"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ClipLoader } from "react-spinners";

export function LoginForm({ page }: { page?: string }) {
  const auth = useAuthStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create_organisation = gql`
    mutation CreateOrganisation(
      $createOrganisationInput: CreateOrganisationInput!
    ) {
      createOrganisation(createOrganisationInput: $createOrganisationInput) {
        name
        id
      }
    }
  `;

  const login_organisation = gql`
    mutation LoginOrganisation(
      $loginOrganisationInput: LoginOrganisationInput!
    ) {
      loginOrganisation(loginOrganisationInput: $loginOrganisationInput) {
        name
        id
      }
    }
  `;

  const [createOrganisation] = useMutation(create_organisation);
  const [loginOrganisation] = useMutation(login_organisation);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password");
    const club = formData.get("club");

    if (page === "register") {
      try {
        const response = await createOrganisation({
          variables: {
            createOrganisationInput: {
              name: club as string,
              passwordHash: password as string,
            },
          },
        });

        auth.setUser({
          id: response.data.createOrganisation.id,
          name: response.data.createOrganisation.name,
        });
        toast.success("Organisation created successfully!", {
          description: "start managing your members now.",
        });
        router.push("/members");
      } catch (error: any) {
        console.error("Error creating organisation:", error);
        const errorMessage =
          error?.message || "Failed to create organisation. Please try again.";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    } else if (page === "login") {
      try {
        const response = await loginOrganisation({
          variables: {
            loginOrganisationInput: {
              name: club as string,
              passwordHash: password as string,
            },
          },
        });
        auth.setUser({
          id: response.data.loginOrganisation.id,
          name: response.data.loginOrganisation.name,
        });
        toast.success("Logged in successfully!");
        router.push("/members");
      } catch (error: any) {
        console.log("Error logging in:", error);
        const errorMessage =
          error?.message || "Failed to create organisation. Please try again.";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-6")}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">
          {page === "register" ? "Create an account" : "Login to your account"}
        </h1>
        <p className="text-muted-foreground text-sm text-balance">
          {page === "register"
            ? "Enter your details below to register"
            : "Enter your email below to login to your account"}
        </p>
      </div>

      <div className="grid gap-6">
        {/* Error Message */}
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        <div className="grid gap-3">
          <Label htmlFor="club">Name of Organisation</Label>
          <Input
            id="club"
            name="club"
            placeholder="e.g., E-Cell, Crux, SWD"
            required
            disabled={isLoading}
          />
        </div>

        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            {page === "login" && (
              <a
                href="#"
                className="ml-auto text-sm underline-offset-4 hover:underline"
              >
                Forgot your password?
              </a>
            )}
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            required
            disabled={isLoading}
          />
        </div>

        <Button
          type="submit"
          variant={"default"}
          className="w-full cursor-pointer"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <ClipLoader size={16} color="white" />
              <span>
                {page === "register" ? "Creating..." : "Logging in..."}
              </span>
            </div>
          ) : page === "register" ? (
            "Register"
          ) : (
            "Login"
          )}
        </Button>
      </div>

      <div className="text-center text-sm">
        {page === "login"
          ? "Don't have an account?"
          : "Already have an account?"}{" "}
        <Link
          href={`/auth/${page === "login" ? "register" : "login"}`}
          className={cn(
            "underline underline-offset-4",
            isLoading ? "pointer-events-none opacity-50" : "hover:underline"
          )}
        >
          {page === "login" ? "Register" : "Login"}
        </Link>
      </div>
    </form>
  );
}
