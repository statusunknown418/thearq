"use client";
import { useSafeParams } from "~/lib/navigation";
import { api } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/shared";

export const EntriesViews = ({
  workspaceId,
  initialData,
}: {
  workspaceId: number;
  initialData: RouterOutputs["logsHistory"]["get"];
}) => {
  const params = useSafeParams("tracker");

  const [data] = api.logsHistory.get.useSuspenseQuery(
    {
      workspaceId,
      date: new Date(),
    },
    {
      initialData,
    },
  );

  return (
    <div className="overflow-y-scroll">
      <div className="grid grid-cols-5 gap-2">
        <section className="grid grid-cols-1 gap-4 rounded-lg border-x border-b">
          <header className="sticky inset-0 rounded-t-lg border-y bg-muted p-2 text-xs text-muted-foreground">
            Monday
          </header>
          <div>1</div>
          <div>2</div>
          <div>3</div>
          <div>4</div>
          <div>5</div>
          <div>5</div>
          <div>5</div>
          <div>5</div>
          <div>5</div>
          <div>5</div>
          <div>5</div>
          <div>5</div>
          <div>5</div>
          <div>5</div>
          <div>5</div>
          <div>5</div>
          <div>5</div>
          <div>5</div>
          <div>6</div>
          <div>7</div>
          <div>8</div>
          <div>9</div>
        </section>
        <section className="grid grid-cols-1 gap-4 rounded-lg border-x border-b">
          <header className="sticky inset-0 rounded-t-lg border-y bg-muted p-2 text-xs text-muted-foreground">
            Tuesday
          </header>
          <div>1</div>
          <div>2</div>
          <div>3</div>
          <div>4</div>
          <div>5</div>
          <div>5</div>
          <div>5</div>
          <div>5</div>
          <div>5</div>
          <div>5</div>
          <div>5</div>
          <div>5</div>
          <div>5</div>
          <div>5</div>
          <div>5</div>
          <div>5</div>
          <div>5</div>
          <div>5</div>
          <div>6</div>
          <div>7</div>
          <div>8</div>
          <div>9</div>
        </section>
        <section className="grid grid-cols-1 gap-4 rounded-lg border-x border-b">
          <header className="sticky inset-0 rounded-t-lg border-y bg-muted p-2 text-xs text-muted-foreground">
            Wednesday
          </header>
          <div>1</div>
          <div>2</div>
          <div>3</div>
          <div>4</div>
          <div>5</div>
          <div>5</div>
          <div>5</div>
          <div>5</div>
          <div>5</div>
          <div>5</div>
          <div>5</div>
          <div>5</div>
          <div>5</div>
          <div>5</div>
          <div>5</div>
          <div>5</div>
          <div>5</div>
          <div>5</div>
          <div>6</div>
          <div>7</div>
          <div>8</div>
          <div>9</div>
        </section>
        <section className="grid grid-cols-1 gap-4 rounded-lg border-x border-b">
          <header className="sticky inset-0 rounded-t-lg border-y bg-muted p-2 text-xs text-muted-foreground">
            Thursday
          </header>
          <div>1</div>
          <div>2</div>
          <div>3</div>
          <div>4</div>
          <div>5</div>
          <div>5</div>
          <div>5</div>
          <div>5</div>
          <div>5</div>
          <div>5</div>
          <div>5</div>
          <div>5</div>
          <div>5</div>
          <div>5</div>
          <div>5</div>
          <div>5</div>
          <div>5</div>
          <div>5</div>
          <div>6</div>
          <div>7</div>
          <div>8</div>
          <div>9</div>
        </section>
        <section className="grid grid-cols-1 gap-4 rounded-lg border-x border-b">
          <header className="sticky inset-0 rounded-t-lg border-y bg-muted p-2 text-xs text-muted-foreground">
            Friday
          </header>
          <div>1</div>
          <div>2</div>
          <div>3</div>
          <div>4</div>
          <div>5</div>
          <div>5</div>
          <div>5</div>
          <div>5</div>
          <div>5</div>
          <div>5</div>
          <div>5</div>
          <div>5</div>
          <div>5</div>
          <div>5</div>
          <div>5</div>
          <div>5</div>
          <div>5</div>
          <div>5</div>
          <div>6</div>
          <div>7</div>
          <div>8</div>
          <div>9</div>
        </section>
      </div>
    </div>
  );
};
