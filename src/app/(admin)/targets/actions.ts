"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getMonthlyTarget(month: string) {
  const session = await getSession();
  if (!session?.id) return null;

  const target = await prisma.monthlyTarget.findUnique({
    where: {
      userId_month: {
        userId: session.id,
        month
      }
    },
    include: {
      entries: {
        orderBy: { date: 'desc' }
      }
    }
  });

  return target;
}

export async function updateTargetAmount(month: string, amount: number) {
  const session = await getSession();
  if (!session?.id) throw new Error("Unauthorized");

  await prisma.monthlyTarget.upsert({
    where: {
      userId_month: {
        userId: session.id,
        month
      }
    },
    update: {
      targetAmount: amount
    },
    create: {
      userId: session.id,
      month,
      targetAmount: amount,
      achievedAmount: 0
    }
  });

  revalidatePath("/targets");
}

async function recalculateTargetTotal(monthlyTargetId: string) {
  const target = await prisma.monthlyTarget.findUnique({
    where: { id: monthlyTargetId },
    include: { entries: true }
  });
  if (!target) return;
  const newTotal = target.entries.reduce((sum, entry) => sum + entry.amount, 0);
  await prisma.monthlyTarget.update({
    where: { id: monthlyTargetId },
    data: { achievedAmount: newTotal }
  });
}

export async function addTargetEntry(month: string, amount: number, dateStr: string) {
  const session = await getSession();
  if (!session?.id) throw new Error("Unauthorized");

  // Ensure monthly target exists
  let target = await prisma.monthlyTarget.findUnique({
    where: { userId_month: { userId: session.id, month } }
  });

  if (!target) {
    target = await prisma.monthlyTarget.create({
      data: {
        userId: session.id,
        month,
        targetAmount: 0,
        achievedAmount: 0
      }
    });
  }

  // Create entry
  await prisma.targetEntry.create({
    data: {
      monthlyTargetId: target.id,
      amount,
      date: new Date(dateStr)
    }
  });

  await recalculateTargetTotal(target.id);
  revalidatePath("/targets");
}

export async function editTargetEntry(entryId: string, newAmount: number, newDateStr: string) {
  const session = await getSession();
  if (!session?.id) throw new Error("Unauthorized");

  const entry = await prisma.targetEntry.findUnique({
    where: { id: entryId },
    include: { monthlyTarget: true }
  });

  if (!entry || entry.monthlyTarget.userId !== session.id) {
    throw new Error("Unauthorized or not found");
  }

  await prisma.targetEntry.update({
    where: { id: entryId },
    data: {
      amount: newAmount,
      date: new Date(newDateStr)
    }
  });

  await recalculateTargetTotal(entry.monthlyTargetId);
  revalidatePath("/targets");
}

export async function deleteTargetEntry(entryId: string) {
  const session = await getSession();
  if (!session?.id) throw new Error("Unauthorized");

  const entry = await prisma.targetEntry.findUnique({
    where: { id: entryId },
    include: { monthlyTarget: true }
  });

  if (!entry || entry.monthlyTarget.userId !== session.id) {
    throw new Error("Unauthorized or not found");
  }

  await prisma.targetEntry.delete({
    where: { id: entryId }
  });

  await recalculateTargetTotal(entry.monthlyTargetId);
  revalidatePath("/targets");
}

export async function getTeamTargets(month: string) {
  const session = await getSession();
  if (!session || session.role !== "SUPERADMIN") return null;

  const allUsers = await prisma.user.findMany({
    select: { id: true, name: true, role: true }
  });

  // Calculate prev month
  const d = new Date(month + "-01");
  d.setMonth(d.getMonth() - 1);
  const prevMonthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

  const targets = await prisma.monthlyTarget.findMany({
    where: { month: { in: [month, prevMonthStr] } }
  });

  return allUsers.map(u => {
    const currentTarget = targets.find(t => t.userId === u.id && t.month === month);
    const pastTarget = targets.find(t => t.userId === u.id && t.month === prevMonthStr);
    
    const currentAchieved = currentTarget?.achievedAmount || 0;
    const pastAchieved = pastTarget?.achievedAmount || 0;
    
    let growthPct = 0;
    if (pastAchieved === 0 && currentAchieved > 0) {
      growthPct = 100;
    } else if (pastAchieved > 0) {
      growthPct = ((currentAchieved - pastAchieved) / pastAchieved) * 100;
    }

    return {
      userId: u.id,
      userName: u.name,
      targetAmount: currentTarget?.targetAmount || 0,
      achievedAmount: currentAchieved,
      growthPct
    };
  }).sort((a, b) => b.achievedAmount - a.achievedAmount);
}
