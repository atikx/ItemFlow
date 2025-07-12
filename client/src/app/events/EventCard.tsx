"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { Event } from "@/types/events.types";
import { DeleteEventDialog } from "./DeleteEventDialog";
import { useRouter } from "next/navigation";

interface EventCardProps {
  event: Event;
  onDeleteEvent: (id: string, eventName: string) => Promise<boolean>;
  deletingEventId: string | null;
}

export const EventCard = ({
  event,
  onDeleteEvent,
  deletingEventId,
}: EventCardProps) => {
  const router = useRouter();

  const handleRedirect = () => {
    localStorage.setItem("eventName", event.name + " " + event.year);
    localStorage.setItem("eventId", event.id);
    router.push("/inventory");
  };
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/30 hover:border-l-primary">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div
            className="flex items-center cursor-pointer gap-4"
            onClick={handleRedirect}
          >
            <div className="p-2 bg-primary/10 rounded-lg">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors">
                {event.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {event.year}
                </Badge>
              </div>
            </div>
          </div>

          <DeleteEventDialog
            event={event}
            onDeleteEvent={onDeleteEvent}
            isDeleting={deletingEventId === event.id}
          />
        </div>
      </CardContent>
    </Card>
  );
};
