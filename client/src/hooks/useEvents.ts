import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { toast } from "sonner";
import { GET_EVENTS } from "@/graphql/events.graphql";
import { CREATE_EVENT, DELETE_EVENT } from "@/graphql/events.graphql";
import {
  Event,
  EventFormData,
  CreateEventInput,
  GroupedEvents,
} from "@/types/events.types";

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isAddLoading, setIsAddLoading] = useState(false);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);

  const { data, loading, error, refetch } = useQuery(GET_EVENTS);

  const [createEvent] = useMutation(CREATE_EVENT, {
    refetchQueries: [{ query: GET_EVENTS }],
  });

  const [deleteEvent] = useMutation(DELETE_EVENT, {
    refetchQueries: [{ query: GET_EVENTS }],
  });

  // Update local state when GraphQL data changes
  useEffect(() => {
    if (data?.events) {
      setEvents(data.events);
    }
  }, [data]);

  const addEvent = async (formData: EventFormData) => {
    if (!formData.name.trim() || !formData.year.trim()) {
      toast.error("Please fill in all fields");
      return false;
    }

    setIsAddLoading(true);
    try {
      const res = await createEvent({
        variables: {
          createEventInput: {
            name: formData.name.trim(),
            year: parseInt(formData.year),
          } as CreateEventInput,
        },
      });

      console.log("Event created:", res.data.createEvent);
      toast.success("Event added successfully!");
      return true;
    } catch (error: any) {
      console.error("Error adding event:", error);
      const errorMessage =
        error?.message || "Failed to add event. Please try again.";
      toast.error(errorMessage);
      return false;
    } finally {
      setIsAddLoading(false);
    }
  };

  const removeEvent = async (id: string, eventName: string) => {
    setDeletingEventId(id);
    try {
      await deleteEvent({
        variables: { removeEventId: id },
      });
      console.log("Event deleted:", id);
      toast.success(`"${eventName}" removed successfully!`);
      return true;
    } catch (error: any) {
      console.error("Error deleting event:", error);
      const errorMessage =
        error?.message || "Failed to delete event. Please try again.";
      toast.error(errorMessage);
      return false;
    } finally {
      setDeletingEventId(null);
    }
  };

  // Sort events by year (latest first) and group by year
  const sortedEvents = [...events].sort((a, b) => b.year - a.year);
  const groupedEvents: GroupedEvents = sortedEvents.reduce((groups, event) => {
    const year = event.year;
    if (!groups[year]) {
      groups[year] = [];
    }
    groups[year].push(event);
    return groups;
  }, {} as GroupedEvents);

  const years = Object.keys(groupedEvents)
    .map(Number)
    .sort((a, b) => b - a);
  const availableYears = [...new Set(events.map((e) => e.year))].sort(
    (a, b) => b - a
  );

  return {
    events,
    groupedEvents,
    years,
    availableYears,
    loading,
    error,
    refetch,
    addEvent,
    removeEvent,
    isAddLoading,
    deletingEventId,
  };
};
