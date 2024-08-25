import { setTimeout } from "timers/promises";
import { reportNewTransactions } from "./communication";
import { Context } from "telegraf";
import { botSampleInterval } from "./environment";

export const startScheduler = async (ctx:Context) => {
    while (true) {
        try {
            await reportNewTransactions(ctx);
            await setTimeout((botSampleInterval ?? 60) * 1000);
        } catch (e) {
            console.log("Reporting to bot failed", new Date(), "for following reason:", e);
        }
    }
}