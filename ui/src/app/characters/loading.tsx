import {
  PageSkeleton,
  PageHeaderSkeleton,
  StatCardsSkeleton,
  RankingSkeleton,
} from "@/components/page-skeleton";

export default function Loading() {
  return (
    <PageSkeleton>
      <PageHeaderSkeleton actions={2} />
      <StatCardsSkeleton count={6} />
      <RankingSkeleton />
    </PageSkeleton>
  );
}
