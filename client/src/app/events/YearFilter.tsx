import { Filter } from "lucide-react";

interface YearFilterProps {
  availableYears: number[];
  selectedYear: number | null;
  onYearChange: (year: number | null) => void;
}

export const YearFilter = ({ availableYears, selectedYear, onYearChange }: YearFilterProps) => {
  if (availableYears.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <Filter className="h-4 w-4 text-muted-foreground" />
      <select
        className="px-3 py-2 border border-input bg-background rounded-md text-sm"
        value={selectedYear || ""}
        onChange={(e) => onYearChange(e.target.value ? Number(e.target.value) : null)}
      >
        <option value="">All Years</option>
        {availableYears.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
};
