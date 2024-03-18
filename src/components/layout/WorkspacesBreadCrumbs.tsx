"use client";
import { useSelectedLayoutSegment, useSelectedLayoutSegments } from "next/navigation";
import { useWorkspaceStore } from "~/lib/stores/workspace-store";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";

export const WorkspacesBreadcrumbs = () => {
  const selectedSegments = useSelectedLayoutSegments();
  const page = useSelectedLayoutSegment();
  const w = useWorkspaceStore((s) => s.active);

  if (page === "settings") {
    return;
  }

  return (
    <Breadcrumb className="mx-10 mt-4">
      <BreadcrumbList>
        {selectedSegments.map((segment, index) => (
          <>
            <BreadcrumbItem key={index}>
              <BreadcrumbLink href={`/${w?.slug}/${segment}`} className="capitalize">
                {segment}
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator />
          </>
        ))}

        <BreadcrumbItem>
          <BreadcrumbPage>Overview</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};
