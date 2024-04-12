import { formatDate } from "date-fns";
import { toNow, useQueryDateState } from "~/lib/stores/dynamic-dates-store";
import { convertTime } from "~/lib/stores/events-store";
import { cn } from "~/lib/utils";

/**
 * @todo Add the required data for each date cell
 * @returns
 */
export const DateCell = ({ date, duration }: { date: Date; duration?: number }) => {
  const [queryDate, setQueryDate] = useQueryDateState();

  const hours = duration ? convertTime(duration) : 0;

  return (
    <button
      className={cn("group/container h-full border-t p-0.5 focus:outline-none focus:ring-0")}
      onClick={() => {
        if (formatDate(date, "yyyy/MM/dd") === toNow()) {
          return setQueryDate(null);
        }

        void setQueryDate(formatDate(date, "yyyy/MM/dd"));
      }}
    >
      <section
        className={cn(
          "group flex h-full flex-col items-center justify-center rounded-lg border border-transparent p-2 transition-all hover:bg-primary hover:text-primary-foreground",
          "group-focus/container:ring group-focus/container:ring-ring group-focus/container:ring-offset-2",
          queryDate === formatDate(date, "yyyy/MM/dd") && "border-primary bg-secondary",
          formatDate(date, "yyyy/MM/dd") === toNow() && "border-dashed border-primary",
        )}
      >
        <p className="text-xs text-muted-foreground group-hover:text-primary-foreground">
          {formatDate(date, "do")}
        </p>

        <section className="mt-auto flex h-full flex-col items-center justify-center gap-1">
          <div className="text-2xl font-bold">{hours}</div>
          <p className="text-sm text-muted-foreground">hours</p>
        </section>
      </section>
    </button>
  );
};
