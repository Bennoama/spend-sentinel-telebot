import { Context } from "telegraf";
import { isAuthorized, getStringOfOptions, parseData, applyCommand } from "./utils";
import { startScheduler } from "./scheduler";

export const handleStart = (ctx:Context) => {
    if (!isAuthorized(ctx)) {
        ctx.reply("Unauthorized");
        return
    };
    startScheduler(ctx)
}

export const handleHelp = (ctx:Context) => {
    if (!isAuthorized(ctx)) {ctx.reply("Unauthorized"); return};
    ctx.reply("Enter '/start' for getting updates on your wasteful spendings!").then(() => {
        ctx.reply("Enter transaction number and status to set the status of the transaction\n" + 
        getStringOfOptions());
    });
}

export const handleText = async (ctx:Context) => {
    if (!isAuthorized(ctx)) {
        ctx.reply("Unauthorized");
        return
    };
    
    if (undefined === ctx.text) {
        ctx.reply("Something went wrong, please try again");
        return;
    }

    const [givenCommand, transactionNumber] = parseData(ctx.text.toLowerCase())
    if (givenCommand === "" || transactionNumber == "") {
        ctx.reply("Must be in format of <status command> <transaction number> or vice versa");
        return;
    }

    if (false === await applyCommand(givenCommand, transactionNumber, ctx)) {
        ctx.reply(givenCommand + " is not a viable command, please get help");
        return;
    }

}
