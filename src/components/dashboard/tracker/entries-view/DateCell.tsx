import { formatDate } from "date-fns";
import { toNow, useQueryDateState } from "~/lib/stores/dynamic-dates-store";
import { cn } from "~/lib/utils";

/**
 * @todo Add the required data for each date cell
 * @returns
 */
export const DateCell = ({ date }: { date: Date }) => {
  const [queryDate, setQueryDate] = useQueryDateState();

  return (
    <button
      className={cn("h-full border-t p-0.5 focus:outline-none focus:ring focus:ring-ring")}
      onClick={() => {
        if (formatDate(date, "yyyy/MM/dd") === toNow()) {
          return setQueryDate(null);
        }

        void setQueryDate(formatDate(date, "yyyy/MM/dd"));
      }}
    >
      <section
        className={cn(
          "group flex h-full flex-col items-center justify-center rounded-lg border border-transparent p-2 transition-colors hover:bg-primary hover:text-primary-foreground",
          queryDate === formatDate(date, "yyyy/MM/dd") && "border-primary bg-secondary",
          formatDate(date, "yyyy/MM/dd") === toNow() && "border-dashed border-primary",
        )}
      >
        <p className="text-xs text-muted-foreground group-hover:text-primary-foreground">
          {formatDate(date, "do")}
        </p>

        <section className="flex flex-grow items-center justify-center gap-2">
          <div className="text-2xl font-bold">0</div>
          <p>hours</p>
        </section>
      </section>
    </button>
  );
};
