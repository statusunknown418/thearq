import { format } from "date-fns";
import { PiCircleDashed } from "react-icons/pi";
import { toNow, useQueryDateState } from "~/lib/stores/dynamic-dates-store";
import { secondsToHoursDecimal } from "~/lib/stores/events-store";
import { cn } from "~/lib/utils";

/**
 * @todo Add the required data for each date cell
 * @returns
 */
export const DateCell = ({ date, entryData }: { date: Date; entryData?: number }) => {
  const [queryDate, setQueryDate] = useQueryDateState();

  const hours = entryData ? secondsToHoursDecimal(entryData) : 0;

  return (
    <button
      className={cn("group/container h-full border-t p-1.5 focus:outline-none focus:ring-0")}
      onClick={() => {
        if (format(date, "yyyy/MM/dd") === toNow()) {
          return setQueryDate(null);
        }

        void setQueryDate(format(date, "yyyy/MM/dd"));
      }}
    >
      <section
        className={cn(
          "group flex h-full flex-col items-center justify-center rounded-lg border border-transparent p-2 transition-all hover:border-primary hover:bg-secondary",
          "group-focus/container:ring group-focus/container:ring-ring group-focus/container:ring-offset-2",
          queryDate === format(date, "yyyy/MM/dd") && "border-primary bg-secondary",
          format(date, "yyyy/MM/dd") === toNow() && "border-dashed border-primary bg-muted",
        )}
      >
        <p className="text-xs text-muted-foreground">{format(date, "do")}</p>

        <section className="mt-auto flex h-full flex-col items-center justify-center gap-1">
          <div className="h-9 text-2xl font-bold">
            {!!entryData ? hours.toFixed(2) : <PiCircleDashed />}
          </div>
          <p className="text-sm text-muted-foreground">hours</p>
        </section>
      </section>
    </button>
  );
};
