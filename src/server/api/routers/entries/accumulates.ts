import { endOfDay } from "date-fns";
import { and } from "drizzle-orm";
import { object, string } from "zod";
import { adjustEndDate, secondsToHoursDecimal } from "~/lib/dates";
import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { getRecentWorkspace } from "../viewer";
import { TRPCError } from "@trpc/server";

export const entriesAccumulatesRouter = createTRPCRouter({
  getTotals: protectedProcedure
    .input(
      object({
        from: string(),
        to: string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const wId = await getRecentWorkspace(ctx.session.user.id);

      if (!wId) {
        return null;
      }

      const summary = await ctx.db.query.timeEntries.findMany({
        where: (t, op) =>
          and(
            op.eq(t.workspaceId, Number(wId)),
            op.gte(t.start, new Date(input.from)),
            op.lte(t.end, endOfDay(adjustEndDate(input.to))),
          ),
        with: {
          project: {
            columns: {
              color: true,
              name: true,
              identifier: true,
              id: true,
            },
            with: {
              users: true,
              client: true,
            },
          },
          workspace: {
            with: {
              users: true,
            },
          },
        },
      });

      const totalTime = summary.reduce((acc, entry) => {
        acc += entry.duration;
        return acc;
      }, 0);

      const nonBillableTime = summary.reduce((acc, entry) => {
        if (!entry.billable) {
          acc += entry.duration;
        }

        return acc;
      }, 0);

      const totalEarnings = summary.reduce((acc, entry) => {
        const user = entry.workspace.users.find((u) => u.userId === entry.userId);

        if (!user) {
          return acc;
        }

        if (!acc) {
          acc = 0;
        }

        if (!!entry.projectId && !!entry.project) {
          const projectUser = entry.project?.users.find((u) => u.userId === entry.userId);

          acc += secondsToHoursDecimal(entry.duration) * (projectUser?.billableRate ?? 1);
          return acc;
        }

        acc += secondsToHoursDecimal(entry.duration) * user.defaultBillableRate;
        return acc;
      }, 0);

      const totalInternalCost = summary.reduce((acc, entry) => {
        const user = entry.workspace.users.find((u) => u.userId === entry.userId);

        if (!user) {
          return acc;
        }

        if (!acc) {
          acc = 0;
        }

        if (!!entry.projectId && !!entry.project) {
          const projectUser = entry.project?.users.find((u) => u.userId === entry.userId);

          acc += secondsToHoursDecimal(entry.duration) * (projectUser?.internalCost ?? 0);
          return acc;
        }

        acc += secondsToHoursDecimal(entry.duration) * user.defaultInternalCost;
        return acc;
      }, 0);

      const groupedByProject = summary.reduce(
        (acc, entry) => {
          const project = entry.project;

          if (!project) {
            return acc;
          }

          if (!acc[project.id]) {
            acc[project.id] = {
              duration: 0,
              project: project.name,
              client: project.client?.name,
              color: project.color,
            };
          }

          acc[project.id]!.duration += entry.duration;

          return acc;
        },
        {} as Record<
          number,
          {
            duration: number;
            project: string;
            client?: string;
            color: string;
          }
        >,
      );

      return {
        totalTime,
        totalEarnings,
        totalInternalCost,
        summary,
        nonBillableTime,
        groupedByProject: Object.entries(groupedByProject)
          .map(([id, value]) => ({
            id: id,
            ...value,
          }))
          .sort((a, b) => b.duration - a.duration)
          .slice(0, 3),
      };
    }),
  getDashboardCharts: protectedProcedure
    .input(
      object({
        from: string(),
        to: string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const wId = await getRecentWorkspace(ctx.session.user.id);

      if (!wId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No workspace selected",
        });
      }

      const summary = await ctx.db.query.timeEntries.findMany({
        where: (t, op) =>
          and(
            op.eq(t.workspaceId, Number(wId)),
            op.gte(t.start, new Date(input.from)),
            op.lte(t.end, adjustEndDate(input.to)),
          ),
        with: {
          project: {
            columns: {
              color: true,
              name: true,
              identifier: true,
              id: true,
            },
            with: {
              users: true,
              client: true,
            },
          },
          user: true,
        },
      });

      const hoursByPerson = summary.reduce(
        (acc, entry) => {
          const user = entry.user;

          if (!user) {
            return acc;
          }

          if (!acc[user.id]) {
            acc[user.id] = {
              duration: 0,
              name: user.name ?? "Anonymous",
            };
          }

          acc[user.id]!.duration += entry.duration;

          return acc;
        },
        {} as Record<
          string,
          {
            duration: number;
            name: string;
          }
        >,
      );

      const hoursByProject = summary.reduce(
        (acc, entry) => {
          const project = entry.project;

          if (!project) {
            return acc;
          }

          if (!acc[project.id]) {
            acc[project.id] = {
              duration: 0,
              project: project.name,
              color: project.color,
            };
          }

          acc[project.id]!.duration += entry.duration;

          return acc;
        },
        {} as Record<
          number,
          {
            duration: number;
            project: string;
            color: string;
          }
        >,
      );

      const billingByClient = summary.reduce(
        (acc, entry) => {
          const client = entry.project?.client;
          const user = entry.project?.users.find((u) => u.userId === entry.userId);

          if (!client || !user) {
            return acc;
          }

          if (!acc[client.id]) {
            acc[client.id] = {
              amount: 0,
              client: client.name,
            };
          }

          acc[client.id]!.amount += secondsToHoursDecimal(entry.duration) * user.billableRate;

          return acc;
        },
        {} as Record<
          number,
          {
            amount: number;
            client: string;
          }
        >,
      );

      const billingArray = Object.entries(billingByClient).map(([id, value]) => ({
        id: id,
        ...value,
      }));

      const projectGroupArray = Object.entries(hoursByProject).map(([id, value]) => ({
        id: id,
        ...value,
      }));

      const personGroupArray = Object.entries(hoursByPerson).map(([id, value]) => ({
        id: id,
        ...value,
      }));

      return {
        summary,
        hoursByProject: projectGroupArray,
        hoursByPerson: personGroupArray,
        billingByClient: billingArray,
      };
    }),
});
