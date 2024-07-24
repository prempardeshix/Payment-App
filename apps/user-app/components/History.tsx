import { Card } from "@repo/ui/card";
import { getServerSession } from "next-auth";
import { authOptions } from "../app/lib/auth";

const session = await getServerSession(authOptions);
const loggedUserId = Number(session?.user?.id);

export default function History({
  transactions,
}: {
  transactions: {
    time: Date;
    amount: number;
    toUserId: number;
    fromUserId: number;
  }[];
}) {
  if (!transactions.length) {
    return (
      <Card title="Recent Transactions">
        <div className="text-center pb-8 pt-8">No Recent transactions</div>
      </Card>
    );
  }
  return (
    <Card title="Recent Transactions">
      <div className="pt-2">
        {transactions.slice(0, 10).map((t) => (
          <div className="flex justify-between">
            <div>
              <div className="text-sm">
                {t.toUserId === loggedUserId ? "Received" : "Sent"}
              </div>
              <div className="text-slate-600 text-xs">
                {t.time.toDateString()}
              </div>
            </div>
            <div className="flex flex-col justify-center">
              + Rs {t.amount / 100}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
