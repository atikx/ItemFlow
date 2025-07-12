import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Item, Member, Department, ItemLog } from "@/types/itemLogs.types";
import { GET_ITEM_LOGS } from "@/graphql/itemLogs.graphql";
import { GET_MEMBERS } from "@/graphql/members.graphql";
import { GET_DEPARTMENTS } from "@/graphql/departments.graphql";
import { GET_ITEMS } from "@/graphql/items.graphql";

export const useInventoryData = () => {
  const [eventId, setEventId] = useState("");
  const [eventName, setEventName] = useState("");
  const [redirecting, setRedirecting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedEventId = localStorage.getItem("eventId");
    const storedEventName = localStorage.getItem("eventName") || "Event";

    if (!storedEventId) {
      setRedirecting(true);
      toast.error("No event selected. Please select an event first.");
      router.push("/events");
      return;
    }

    setEventId(storedEventId);
    setEventName(storedEventName);
  }, [router]);

  const {
    data: itemLogsData,
    loading: itemLogsLoading,
    error: itemLogsError,
    refetch: refetchItemLogs,
  } = useQuery(GET_ITEM_LOGS, {
    variables: { eventId },
    skip: !eventId || redirecting,
  });

  const {
    data: membersData,
    loading: membersLoading,
    error: membersError,
  } = useQuery(GET_MEMBERS);

  const {
    data: departmentsData,
    loading: departmentsLoading,
    error: departmentsError,
  } = useQuery(GET_DEPARTMENTS);

  const {
    data: itemsData,
    loading: itemsLoading,
    error: itemsError,
  } = useQuery(GET_ITEMS);

  const items: Item[] = itemsData?.items || [];
  const members: Member[] = membersData?.members || [];
  const departments: Department[] = departmentsData?.departments || [];
  const itemLogs: ItemLog[] = itemLogsData?.itemLogs || [];

  const isLoading =
    membersLoading || departmentsLoading || itemsLoading || itemLogsLoading;
  const hasError =
    membersError || departmentsError || itemsError || itemLogsError;

  return {
    eventId,
    eventName,
    items,
    members,
    departments,
    itemLogs,
    isLoading,
    hasError,
    refetchItemLogs,
  };
};
