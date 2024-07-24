"use server";

import prisma from "@repo/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";

export async function p2ptransfer(sendAmount: number, receiverNo: string) {
  //   console.log("here");
  const session = await getServerSession(authOptions);
  //   console.log(session.user.id);
  const userId = session.user.id;

  if (!userId) {
    // console.log("Signin Required");
    return {
      message: "Signin Required",
      status: 500,
    };
  }

  try {
    const receiver = await prisma.user.findUnique({
      where: {
        number: receiverNo,
      },
    });

    // console.log("here");
    if (!receiver) {
      console.log(`Receiver ${receiverNo} does not exist!`);
      return {
        message: `Receiver ${receiverNo} does not exist!`,
        status: 500,
      };
    }

    const balanceChecker = await prisma.balance.findUnique({
      where: {
        userId: Number(userId),
      },
    });
    // console.log(balanceChecker);
    if (balanceChecker?.amount! < sendAmount) {
      console.log("Not enough balance!");
      return {
        message: "Not enough balance!",
        status: 500,
      };
    }

    await prisma.$transaction([
      prisma.$queryRaw`SELECT * FROM "Balance" WHERE "userId" = ${Number(receiverNo)} FOR UPDATE`,

      prisma.balance.updateMany({
        where: { userId: Number(userId) },
        data: {
          amount: {
            decrement: sendAmount,
          },
        },
      }),

      prisma.balance.update({
        where: {
          userId: receiver.id,
        },
        data: {
          amount: {
            increment: sendAmount,
          },
        },
      }),

      prisma.p2pTransfer.create({
        data: {
          amount: Number(sendAmount),
          timestamp: new Date(),
          fromUserId: Number(userId),
          toUserId: receiver.id,
        },
      }),
    ]);

    console.log("Transfer successfully completed!");
    return {
      message: "Transfer successfully completed!",
    };
  } catch (e: any) {
    console.log(e.message);
    return {
      message: e.message,
      status: 500,
    };
  }
}
