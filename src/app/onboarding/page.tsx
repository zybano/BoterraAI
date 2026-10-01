import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { INDUSTRIES } from "@/lib/catalog/industries";
import { COUNTRIES, GOAL_OPTIONS, REVENUE_BANDS, TEAM_SIZES } from "@/lib/catalog/regions";
import { Logo } from "@/components/logo";
import { OnboardingWizard } from "./wizard";

export const metadata: Metadata = { title: "Set up your workspace" };

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.workspaceId) redirect("/app");

  return (
    <div className="hero-glow min-h-screen px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <Logo dark />
        <div className="mt-8 rounded-3xl bg-white p-6 shadow-2xl sm:p-10">
          <OnboardingWizard
            firstName={user.name.split(" ")[0]}
            industries={INDUSTRIES.map(({ id, name, icon, description }) => ({ id, name, icon, description }))}
            countries={COUNTRIES.map((c) => c.name)}
            teamSizes={TEAM_SIZES}
            revenueBands={REVENUE_BANDS}
            goalOptions={GOAL_OPTIONS}
          />
        </div>
      </div>
    </div>
  );
}
