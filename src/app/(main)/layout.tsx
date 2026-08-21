import type { ReactNode } from "react";
import { BottomNav } from "@/components/layout/BottomNav";
import { OfflineBanner } from "@/components/common/OfflineBanner";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <OfflineBanner />
      <main className="mx-auto w-full max-w-lg flex-1 pb-24">{children}</main>
      <BottomNav />
    </div>
  );
}
