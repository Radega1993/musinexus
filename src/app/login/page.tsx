"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/Container";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/feed";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password.");
      return;
    }
    if (res?.ok) {
      router.push(callbackUrl);
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Container>
        <Card variant="glass" className="mx-auto w-full max-w-sm">
          <h1 className="text-xl font-semibold text-brand-text">Log in</h1>
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            {error && (
              <p className="text-sm text-red-500" role="alert">
                {error}
              </p>
            )}
            <label className="block">
              <span className="text-sm font-medium text-brand-muted">
                Email
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="mt-1 w-full rounded-xl border border-brand-border bg-brand-bg px-3 py-2 text-brand-text"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-brand-muted">
                Password
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="mt-1 w-full rounded-xl border border-brand-border bg-brand-bg px-3 py-2 text-brand-text"
              />
            </label>
            <Button type="submit" disabled={loading}>
              {loading ? "Signing in…" : "Log in"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-brand-muted">
            No account?{" "}
            <Link
              href="/register"
              className="font-medium text-brand-text hover:underline"
            >
              Sign up
            </Link>
          </p>
        </Card>
      </Container>
    </div>
  );
}
