import { Separator } from "@/components/ui/separator";

interface EventStatsProps {
  totalEvents: number;
  totalYears: number;
}

export const EventStats = ({ totalEvents, totalYears }: EventStatsProps) => {
  if (totalEvents === 0) return null;

  return (
    <div className="flex justify-center gap-6 mb-8">
      <div className="text-center">
        <div className="text-2xl font-bold text-primary">{totalEvents}</div>
        <div className="text-sm text-muted-foreground">Total Events</div>
      </div>
      <Separator orientation="vertical" className="h-12" />
      <div className="text-center">
        <div className="text-2xl font-bold text-primary">{totalYears}</div>
        <div className="text-sm text-muted-foreground">Active Years</div>
      </div>
    </div>
  );
};
