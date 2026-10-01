import { Logo } from "@/components/logo";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="hero-glow flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <Logo dark />
      <div className="mt-8 w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">{children}</div>
    </div>
  );
}
