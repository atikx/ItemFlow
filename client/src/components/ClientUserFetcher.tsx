"use client";

import { gql, useQuery } from "@apollo/client";
import { useEffect } from "react";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const GET_ORG = gql`
  query CheckOrganisationLogin {
    checkOrganisationLogin {
      id
      name
    }
  }
`;

export function ClientUserFetcher() {
  const { setUser, clearUser } = useAuthStore();
  const { data, loading, error } = useQuery(GET_ORG);
  const router = useRouter();

  useEffect(() => {
    if (data?.checkOrganisationLogin) {
      console.log(data);
      setUser({
        id: data.checkOrganisationLogin.id,
        name: data.checkOrganisationLogin.name,
      });
    } else if (!loading && error) {
      console.error("Error fetching user:", error);
      clearUser();
      toast.error("Failed to fetch user data. Please log in.");
      router.push("/auth/login"); // ✅ redirect if not logged in
    }
  }, [data, error, loading, setUser, clearUser, router]);

  return null;
}
