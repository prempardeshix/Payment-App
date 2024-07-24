import React from "react";
import SendCard from "../../../components/SendCard";
import { getServerSession } from "next-auth";
import prisma from "@repo/db/client";
import { authOptions } from "../../lib/auth";
import History from "../../../components/History";

async function getTransfers() {
  const session = await getServerSession(authOptions);
  const txns = await prisma.p2pTransfer.findMany({
    where: {
      OR: [
        {
          toUserId: Number(session?.user?.id),
        },
        {
          fromUserId: Number(session?.user?.id),
        },
      ],
    },
  });
  return txns.map((t) => ({
    time: t.timestamp,
    toUserId: t.toUserId,
    fromUserId: t.fromUserId,
    amount: t.amount,
  }));
}

export default async function () {
  const transactions = await getTransfers();
  return (
    <div className="w-screen">
      <div className="text-4xl text-[#6a51a6] pt-8 mb-8 font-bold">
        P2P Transfer
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 p-4">
        <div>
          <SendCard></SendCard>
        </div>
        <div>
          <div className="pt-4">
            <History transactions={transactions} />
          </div>
        </div>
      </div>
    </div>
  );
}
