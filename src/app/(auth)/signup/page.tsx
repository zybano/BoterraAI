import type { Metadata } from "next";
import Link from "next/link";
import { TRIAL_DAYS } from "@/lib/catalog/plans";
import { signup } from "../actions";
import { AuthForm } from "../auth-form";

export const metadata: Metadata = { title: "Create your account" };

export default function SignupPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-slate-900">Hire your AI workforce</h1>
      <p className="mt-1 mb-6 text-sm text-slate-600">
        Free forever plan, plus {TRIAL_DAYS} days of every agent. No card required.
      </p>
      <AuthForm action={signup} mode="signup" />
      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account? <Link href="/login" className="font-semibold text-brand-700 hover:underline">Log in</Link>
      </p>
    </>
  );
}
