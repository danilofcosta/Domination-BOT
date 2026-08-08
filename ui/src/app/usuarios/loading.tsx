import {
  PageSkeleton,
  PageHeaderSkeleton,
  FiltersBarSkeleton,
  TableSkeleton,
} from "@/components/page-skeleton";

export default function Loading() {
  return (
    <PageSkeleton>
      <PageHeaderSkeleton actions={1} />
      <FiltersBarSkeleton />
      <TableSkeleton rows={8} />
    </PageSkeleton>
  );
}
