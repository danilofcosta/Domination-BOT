import {
  PageSkeleton,
  PageHeaderSkeleton,
  GridCardsSkeleton,
} from "@/components/page-skeleton";

export default function Loading() {
  return (
    <PageSkeleton>
      <PageHeaderSkeleton actions={2} />
      <GridCardsSkeleton count={6} />
    </PageSkeleton>
  );
}
