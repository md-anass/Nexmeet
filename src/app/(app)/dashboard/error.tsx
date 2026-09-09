"use client";

import { CircleAlert, RefreshCw } from "lucide-react";
import { Button, Surface } from "@/components/ui";

export default function DashboardError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div className="mx-auto grid min-h-[60dvh] w-full max-w-3xl place-items-center">
      <Surface variant="elevated" className="w-full p-7 text-center sm:p-10">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-red-50 text-red-600"><CircleAlert className="size-6" aria-hidden="true" /></span>
        <h1 className="nm-section-heading mt-5">We could not open your dashboard</h1>
        <p className="nm-body-secondary mx-auto mt-2 max-w-md">Your account is safe. Try loading your meeting workspace again.</p>
        <Button type="button" className="mt-6" onClick={retry}><RefreshCw className="size-4" aria-hidden="true" />Try again</Button>
      </Surface>
    </div>
  );
}
