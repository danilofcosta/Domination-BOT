import {
  PageSkeleton,
  PageHeaderSkeleton,
  GridCardsSkeleton,
} from "@/components/page-skeleton";

export default function Loading() {
  return (
    <PageSkeleton>
      <PageHeaderSkeleton actions={1} />
      <GridCardsSkeleton count={6} />
    </PageSkeleton>
  );
}
