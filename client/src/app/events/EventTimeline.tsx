import { GroupedEvents } from "@/types/events.types";
import { EventCard } from "./EventCard";

interface EventTimelineProps {
  groupedEvents: GroupedEvents;
  filteredYears: number[];
  onDeleteEvent: (id: string, eventName: string) => Promise<boolean>;
  deletingEventId: string | null;
}

export const EventTimeline = ({
  groupedEvents,
  filteredYears,
  onDeleteEvent,
  deletingEventId,
}: EventTimelineProps) => {
  return (
    <div className="relative">
      {/* Timeline Line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-transparent"></div>

      <div className="space-y-12">
        {filteredYears.map((year) => (
          <div key={year} className="relative">
            {/* Year Badge */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative z-10 flex items-center justify-center w-16 h-16 bg-primary rounded-full shadow-lg">
                <span className="text-primary-foreground font-bold text-lg">
                  {year}
                </span>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground">{year}</h2>
                <p className="text-muted-foreground">
                  {groupedEvents[year].length} event
                  {groupedEvents[year].length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* Events for this year */}
            <div className="ml-20 space-y-4">
              {groupedEvents[year].map((event : any) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onDeleteEvent={onDeleteEvent}
                  deletingEventId={deletingEventId}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
