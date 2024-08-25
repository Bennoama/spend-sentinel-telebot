import axios, { AxiosError, AxiosResponse } from "axios";
import { Context } from "telegraf";
import { transactionApiUrl } from "./environment";
import { ApprovalStatus, MoneyTransaction } from "../shared/types"; // TODO needs to be linked to backend types

const sendReply = (ctx:Context, response:AxiosResponse<MoneyTransaction[]>) => {
    const moneyTransactions:MoneyTransaction[] = response.data;
    moneyTransactions.forEach(async (transaction:MoneyTransaction) => {
        const replyInformation = getReplyInformation(transaction);
        try {
            await axios.put(transactionApiUrl, {...transaction, ReportedToBot:true});
            if (moneyTransactions.length < 30)
                ctx.reply("*New transaction found:*\n" + JSON.stringify(replyInformation, null, 1).replace(/[{"'}]/g,''));
        } catch (e) {
            console.log("Failed to send reply in chat, transaction number:", transaction.TransNum, "for following error:", e);
        }
    });
    if (moneyTransactions.length >= 30) ctx.reply(moneyTransactions.length + " new transactions found");
    console.log(moneyTransactions.length, "new transactions found");
}

const getReplyInformation = (transaction: MoneyTransaction):Record<string, string> => {
    const data:Record<string, string> = {};
    const attributesToInclude = ['TransNum', 'Amount', 'Currency', 'Description', 'TransactionDate', 'CardNumber'];
    const attributeNameInChat:Record<string,string> = {
        'TransNum': 'Transaction Number',
        'Amount': 'Amount',
        'Currency':'Currency',
        'Description':'Description',
        'TransactionDate': 'Transaction Date',
        'CardNumber': 'Card last 4 digits',
    }
    Object.entries(transaction).forEach(([key, value]) => {
        if (attributesToInclude.includes(key)) {
            data[attributeNameInChat[key]] = value as string;
        }
    });
    return data;
}

const getDataOfTransaction = async (transactionNumber:string): Promise<MoneyTransaction | null | undefined> => {
    try {
        const getResponse: AxiosResponse = await axios.get(transactionApiUrl + "/" + transactionNumber);
        return getResponse.data;
    } catch (e) {
        if (axios.isAxiosError(e)) {
            const axiosError:AxiosError = e;
            if (!axiosError.response) return undefined;
            if (axiosError.response.status === 404) return null
            return undefined
        }
    }
}

export const updateTransaction = async (approvalStatus:ApprovalStatus, transactionNumber:string):Promise<string> => {
    const statusWord = ['Declined', 'Unspecified', 'Approved'];


    const data:MoneyTransaction | null | undefined = await getDataOfTransaction(transactionNumber);
    if (null === data) return "Transaction " + transactionNumber + " is not the transaction you are looking for";
    if (undefined === data) return "Fetching data failed " + transactionNumber + "\nTalk to Maor or something idk lol";

    data['Status'] = approvalStatus;
    try {
        const putResponse: AxiosResponse = await axios.put(transactionApiUrl, data);
        if (putResponse.status !== 200) {
            return "Updating transaction " + transactionNumber + " failed.\nTalk to Maor or something idk lol";
        }
    } catch(e) {
        return "An error occured" + e;
    }

    return ("Transaction number: " + transactionNumber + " was updated to status of " + statusWord[approvalStatus]);
}

export const reportNewTransactions = async (ctx:Context) => {
    try {
        const response:AxiosResponse<MoneyTransaction[]> = await axios.get(transactionApiUrl + "notReportedToBot", {
        });
        sendReply(ctx, response);
    } catch {
        ctx.reply("An error occured:");
    };

}
