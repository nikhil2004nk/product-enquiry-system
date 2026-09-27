import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SuperadminTargetClient from "./SuperadminTargetClient";

export const dynamic = "force-dynamic";

export default async function SuperadminTargetsPage(props: { searchParams: Promise<{ month?: string }> }) {
  const session = await getSession();
  if (session?.role !== "SUPERADMIN") redirect("/dashboard");

  const searchParams = await props.searchParams;
  
  // Default to current month
  const d = new Date();
  const currentMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  const month = searchParams?.month || currentMonth;

  // Fetch all admins and their targets for this month
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    include: {
      monthlyTargets: {
        where: { month }
      }
    },
    orderBy: { name: "asc" }
  });

  return <SuperadminTargetClient initialMonth={month} admins={admins} />;
}
