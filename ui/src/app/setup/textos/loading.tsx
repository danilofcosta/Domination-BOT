import {
  PageSkeleton,
  PageHeaderSkeleton,
  PanelSkeleton,
} from "@/components/page-skeleton";

export default function Loading() {
  return (
    <PageSkeleton>
      <PageHeaderSkeleton actions={1} />
      <div className="grid flex-1 gap-6 lg:grid-cols-[340px_1fr]">
        <PanelSkeleton rows={10} title={false} />
        <div className="flex flex-col gap-6">
          <PanelSkeleton rows={6} />
          <PanelSkeleton rows={3} />
        </div>
      </div>
    </PageSkeleton>
  );
}
