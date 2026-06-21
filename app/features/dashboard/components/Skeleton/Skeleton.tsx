import { Skeleton as SkeletonComponent, Stack } from "@zvoove/unity-ui";

const Skeleton = () => (
  <Stack>
    <SkeletonComponent width={250} height={100} />
    <SkeletonComponent width="100%" height={80} />
    <Stack direction="row" gap="sm">
      <SkeletonComponent width="50%" height={100} />
      <SkeletonComponent width="50%" height={100} />
    </Stack>
    <Stack direction="row" gap="sm">
      <SkeletonComponent width="50%" height={100} />
      <SkeletonComponent width="50%" height={100} />
    </Stack>
    <SkeletonComponent width="100%" height={250} />
  </Stack>
);

export default Skeleton;
