import {
  PageSkeleton,
  PageHeaderSkeleton,
  StatCardsSkeleton,
  PanelSkeleton,
} from "@/components/page-skeleton";

export default function Loading() {
  return (
    <PageSkeleton>
      <PageHeaderSkeleton actions={2} />
      <StatCardsSkeleton count={4} />
      <PanelSkeleton rows={6} />
    </PageSkeleton>
  );
}
