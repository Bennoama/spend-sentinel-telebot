import { Context } from "telegraf";
import { allowedIDs } from "../environment";
import { updateTransaction } from "./communication";

const statusesWords = [
    ['decline', 'dec', 'סרב', 'לא', 'מסורב', 'סירוב', 'x', 'בסדר', 'd'], // decline - status value is 0
    ['check', 'chk', 'בדוק', 'אולי', 'בבדיקה', 'בדיקה', 'c'], // unspecified - status value is 1
    ["approve", "app", "אשר", 'כן','מאושר', 'אישור', 'v', 'ok', 'a'], // approve - status value is 2
]

export const applyCommand = async (givenCommand:string, transactionNumber:string, ctx:Context) => {
    for (const [index, statusWords] of statusesWords.entries()) {
        if (statusWords.includes(givenCommand)) {
            ctx.reply(await updateTransaction(index, transactionNumber));
            return true;
        }
    }
    
    return false;
}

export const getStringOfOptions = () => {
    return "\nStatus commands:\n" + statusesWords.map(innerArray => innerArray.join(', ')).join('\n').replace(/[\[\]'"{}]/g,'');
}

export const parseData = (msg:string): string[] => {
    const words = msg.split(' ');
    if (words.length !== 2) {
        return ["", ""];
    }

    words.sort((a:string, b:string) => { // place status at first place for parsing
        const regex = /^[a-zA-Z]+$/;
        return (regex.test(a) ? -1 : 1);
    })
    return words
}

export const isAuthorized = (ctx:Context):boolean => {
    if (undefined === ctx.from) return false;
    return (allowedIDs.includes(ctx.from.id));
};


