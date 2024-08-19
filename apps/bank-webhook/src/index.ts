import express from "express";
import db from "@repo/db/client";
import prisma from "@repo/db/client";
const app = express();

app.use(express.json());

app.post("/hdfcWebhook", async (req, res) => {
  
  const paymentInformation: {
    token: string;
    userId: string;
    amount: string;
  } = {
    token: req.body.token,
    userId: req.body.user_identifier,
    amount: req.body.amount,
  };

  try {
    const onRampDetail = await prisma.onRampTransaction.findUnique({
      where: {
        token: paymentInformation.token,
      },
    });

    if (!onRampDetail) {
      return res.json({
        message: "Error Occured",
      });
    }

    if (onRampDetail?.status != "Processing") {
      return res.json({
        message: "Payment already processed!",
      });
    }

    await db.$transaction([
      db.balance.updateMany({
        where: {
          userId: Number(paymentInformation.userId),
        },
        data: {
          amount: {
            increment: Number(paymentInformation.amount),
          },
        },
      }),
      db.onRampTransaction.updateMany({
        where: {
          token: paymentInformation.token,
        },
        data: {
          status: "Success",
        },
      }),
    ]);

    res.json({
      message: "Captured",
    });
  } catch (e) {
    console.error(e);
    res.status(411).json({
      message: "Error while processing webhook",
    });
  }
});

app.listen(3004);
