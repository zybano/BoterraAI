import type { Metadata } from "next";
import Link from "next/link";
import { login } from "../actions";
import { AuthForm } from "../auth-form";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
      <p className="mt-1 mb-6 text-sm text-slate-600">Your agents have been busy.</p>
      <AuthForm action={login} mode="login" />
      <p className="mt-6 text-center text-sm text-slate-600">
        New to Boterra? <Link href="/signup" className="font-semibold text-brand-700 hover:underline">Create a free account</Link>
      </p>
    </>
  );
}
