import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TargetClient from "./TargetClient";

export const dynamic = "force-dynamic";

export default async function TargetsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  // Get current month string
  const d = new Date();
  const currentMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

  const target = await prisma.monthlyTarget.findUnique({
    where: {
      userId_month: {
        userId: session.id,
        month: currentMonth
      }
    },
    include: {
      entries: { orderBy: { date: 'desc' } }
    }
  });

  const historicalTargets = await prisma.monthlyTarget.findMany({
    where: { userId: session.id },
    orderBy: { month: "desc" },
    take: 12
  });

  const isSuperAdmin = session.role === "SUPERADMIN";

  return <TargetClient initialMonth={currentMonth} initialTarget={target} historicalTargets={historicalTargets} isSuperAdmin={isSuperAdmin} />;
}
