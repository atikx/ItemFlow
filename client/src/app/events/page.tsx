"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Sparkles, CalendarDays, Loader2, AlertCircle, Plus } from "lucide-react";
import { useEvents } from "@/hooks/useEvents";
import { AddEventDialog } from "./AddEventDialog";
import { YearFilter } from "./YearFilter";
import { EventStats } from "./EventStats";
import { EventTimeline } from "./EventTimeline";

export default function EventsPage() {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const {
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
  } = useEvents();

  const filteredYears = selectedYear ? [selectedYear] : years;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-muted/10 to-background">
        <div className="container mx-auto py-8 px-4 max-w-4xl">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-lg text-muted-foreground">Loading events...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-muted/10 to-background">
        <div className="container mx-auto py-8 px-4 max-w-4xl">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <div className="p-4 bg-destructive/10 rounded-full w-fit mx-auto">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Failed to load events
                </h3>
                <p className="text-muted-foreground mb-4">{error.message}</p>
                <Button onClick={() => refetch()} size="lg">
                  <Loader2 className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/10 to-background">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="p-4 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl">
                <Calendar className="h-12 w-12 text-primary" />
              </div>
              <div className="absolute -top-1 -right-1">
                <Sparkles className="h-6 w-6 text-primary animate-pulse" />
              </div>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-foreground mb-3">
            Events Timeline
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Manage and track your organization's events across the years
          </p>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <AddEventDialog onAddEvent={addEvent} isLoading={isAddLoading} />
            <YearFilter
              availableYears={availableYears}
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
            />
          </div>

          <EventStats totalEvents={events.length} totalYears={years.length} />
        </div>

        {/* Content Section */}
        {events.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-card rounded-3xl p-12 border-2 border-dashed border-border max-w-md mx-auto">
              <div className="p-6 bg-muted/50 rounded-full w-fit mx-auto mb-6">
                <CalendarDays className="h-16 w-16 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-semibold text-card-foreground mb-4">
                No events yet
              </h3>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Start building your organization's event timeline by creating your first event.
              </p>
              <AddEventDialog
                onAddEvent={addEvent}
                isLoading={isAddLoading}
                trigger={
                  <Button size="lg">
                    <Plus className="h-5 w-5 mr-2" />
                    Create Your First Event
                  </Button>
                }
              />
            </div>
          </div>
        ) : (
          <EventTimeline
            groupedEvents={groupedEvents}
            filteredYears={filteredYears}
            onDeleteEvent={removeEvent}
            deletingEventId={deletingEventId}
          />
        )}
      </div>
    </div>
  );
}
