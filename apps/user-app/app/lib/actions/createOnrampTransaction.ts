"use server";

import prisma from "@repo/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";

export async function createOnrampTransaction(
  amount: number,
  provider: string
) {
  const session = await getServerSession(authOptions);
  const userId = session.user.id;

  const token = Math.random().toString();

  if (!userId) {
    return {
      message: "User not logged in",
    };
  }

  await prisma.onRampTransaction.create({
    data: {
      token,
      provider,
      amount: Number(amount),
      userId: Number(userId),
      startTime: new Date(),
      status: "Processing",
    },
  });

  return {
    message: "Onramp transaction added",
  };
}
