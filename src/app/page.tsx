"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session) {
      router.replace("/feed");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-brand-muted">Loading…</p>
      </div>
    );
  }

  if (session) {
    return null;
  }

  return (
    <div className="min-h-screen px-4 py-16">
      <Container>
        <main className="grid min-h-[70vh] grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col justify-center gap-8 text-center lg:text-left">
            <h1 className="text-4xl font-semibold tracking-tight text-brand-text sm:text-5xl">
              Welcome to Musinexus
            </h1>
            <p className="text-lg text-brand-muted">
              Share your music, discover artists, and grow your audience.
            </p>
            <Card variant="glass" className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <Button size="lg" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button variant="secondary" size="lg" asChild>
                <Link href="/register">Sign up</Link>
              </Button>
            </Card>
          </div>
          <div className="flex items-center justify-center">
            <div className="aspect-square w-full max-w-md rounded-2xl bg-brand-panel border border-brand-border flex items-center justify-center text-brand-muted">
              Illustration placeholder
            </div>
          </div>
        </main>
      </Container>
    </div>
  );
}
