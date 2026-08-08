import {
  PageSkeleton,
  PageHeaderSkeleton,
  PanelSkeleton,
} from "@/components/page-skeleton";

export default function Loading() {
  return (
    <PageSkeleton>
      <PageHeaderSkeleton actions={1} />
      <PanelSkeleton rows={8} />
    </PageSkeleton>
  );
}
