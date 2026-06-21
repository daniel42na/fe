import { Skeleton as SkeletonComponent, Stack } from "@zvoove/unity-ui";

const Skeleton = () => (
  <Stack>
    <SkeletonComponent width={250} height={100} />
    <SkeletonComponent width="100%" height={600} />
  </Stack>
);

export default Skeleton;
