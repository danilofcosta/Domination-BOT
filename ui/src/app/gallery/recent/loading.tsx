import {
  PageSkeleton,
  PageHeaderSkeleton,
  FiltersBarSkeleton,
  GallerySkeleton,
} from "@/components/page-skeleton";

export default function Loading() {
  return (
    <PageSkeleton>
      <PageHeaderSkeleton actions={1} />
      <FiltersBarSkeleton />
      <GallerySkeleton count={12} />
    </PageSkeleton>
  );
}
