import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <p className="text-accent text-sm font-medium uppercase tracking-wide mb-2">
        {APP_NAME}
      </p>
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="text-muted mt-2 max-w-md">
        That path does not exist. Head back to something familiar.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/">
          <Button variant="secondary">Home</Button>
        </Link>
        <Link href="/dashboard">
          <Button>Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
