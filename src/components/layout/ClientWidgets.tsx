"use client";

import dynamic from "next/dynamic";

// Loaded after hydration — none of these are needed for the initial paint
const CustomCursor = dynamic(
  () => import("@/components/ui/CustomCursor").then((m) => ({ default: m.CustomCursor })),
  { ssr: false }
);
const ScrollProgress = dynamic(
  () => import("@/components/ui/ScrollProgress").then((m) => ({ default: m.ScrollProgress })),
  { ssr: false }
);
const RobotWatcher = dynamic(
  () => import("@/components/ui/RobotWatcher").then((m) => ({ default: m.RobotWatcher })),
  { ssr: false }
);

export function ClientWidgets() {
  return (
    <>
      <CustomCursor />
      <ScrollProgress />
      <RobotWatcher />
    </>
  );
}
