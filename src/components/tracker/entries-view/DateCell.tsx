import { format } from "date-fns";
import { Fragment } from "react";
import { PiCircleDashed } from "react-icons/pi";
import { StackTooltip } from "~/components/ui/tooltip";
import { computeDuration, secondsToHoursDecimal } from "~/lib/dates";
import { toNow, useQueryDateState } from "~/lib/stores/dynamic-dates-store";
import { cn } from "~/lib/utils";
import { type RouterOutputs } from "~/trpc/shared";

/**
 * @todo Add the required data for each date cell
 * @returns
 */
export const DateCell = ({
  date,
  entrySummary,
  entryList,
}: {
  date: Date;
  entrySummary?: number;
  entryList?: RouterOutputs["entries"]["getSummary"]["entriesByDate"][number];
}) => {
  const [queryDate, setQueryDate] = useQueryDateState();

  const hours = entrySummary ? secondsToHoursDecimal(entrySummary) : 0;

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
      <StackTooltip
        side="top"
        content={
          !!entryList ? (
            <ul className="flex flex-col text-left">
              {entryList.map((entry) => (
                <Fragment key={entry.id}>
                  <li
                    key={entry.id}
                    className="flex w-full items-center justify-between gap-4 p-1 text-left"
                  >
                    <p className="flex flex-col gap-1">
                      {entry.projectId && (
                        <span className="text-foreground">{entry.project?.name}</span>
                      )}
                      <span className="line-clamp-2 max-w-40 break-words">{entry.description}</span>
                    </p>

                    {!!entry.start && !!entry.end && (
                      <span className="font-medium text-foreground">
                        {secondsToHoursDecimal(
                          computeDuration({
                            start: entry.start,
                            end: entry.end,
                          }),
                        ).toFixed(2)}
                        h
                      </span>
                    )}
                  </li>
                </Fragment>
              ))}
            </ul>
          ) : (
            <span>No entries for {format(date, "LLL ee")}</span>
          )
        }
      >
        <section
          className={cn(
            "group flex h-full flex-col items-center justify-center rounded-lg border border-transparent p-2 transition-all hover:border-ring hover:bg-secondary dark:hover:bg-background",
            "group-focus/container:ring group-focus/container:ring-ring group-focus/container:ring-offset-1 dark:group-focus/container:ring-offset-secondary",
            queryDate === format(date, "yyyy/MM/dd") && "border-ring bg-secondary",
            format(date, "yyyy/MM/dd") === toNow() && "border-dashed border-muted-foreground",
          )}
        >
          <p className="text-xs text-muted-foreground">{format(date, "do")}</p>

          <section className="mt-auto flex h-full flex-col items-center justify-center gap-1">
            <div className="h-9 text-2xl font-medium tabular-nums">
              {!!entrySummary ? (
                hours.toFixed(2)
              ) : (
                <PiCircleDashed className="text-muted-foreground" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">hours</p>
          </section>
        </section>
      </StackTooltip>
    </button>
  );
};
