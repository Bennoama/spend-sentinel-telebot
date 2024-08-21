import axios, { AxiosError, AxiosResponse } from "axios";
import { Context } from "telegraf";
// import { getLastTransactionDate, updateLatestTransactionDate } from "./lastTransactionState"; // TODO - needs to be linked to same file as scraper
import { serverUrl } from "./environment";
import { ApprovalStatus, MoneyTransaction } from "./shared/types"; // TODO needs to be linked to backend types

const sendReply = (ctx:Context, response:AxiosResponse<any, any>) => {
    const moneyTransactions:MoneyTransaction[] = response.data;
    let i = 0;
    console.log(moneyTransactions);
    moneyTransactions.forEach(async (transaction:MoneyTransaction) => {
        const replyInformation = getReplyInformation(transaction);
        try {
            transaction.ReportedToBot = true;
            await axios.put(serverUrl, transaction);
            if (moneyTransactions.length < 30)
                ctx.reply("*New transaction found:*\n" + JSON.stringify(replyInformation, null, 1).replace(/[{"'}]/g,''));
        } catch (e:any) {
            console.log("Failed to send reply in chat, transaction number:", transaction.TransNum);
        }
    });
    if (moneyTransactions.length >= 30)
        ctx.reply(moneyTransactions.length.toString() + " new transactions found");
    console.log("Done");
}

const getReplyInformation = (transaction: MoneyTransaction):Record<string, any> => {
    const data:Record<string, any> = {};
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
            data[attributeNameInChat[key]] = value;
        }
    });
    return data;
}

const getDataOfTransaction = async (transactionNumber:string): Promise<MoneyTransaction | null | undefined> => {
    try {
        const getResponse: AxiosResponse = await axios.get(serverUrl + "/" + transactionNumber);
        return getResponse.data;
    } catch (e:any) {
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
    const putResponse: AxiosResponse = await axios.put(serverUrl, data);

    if (putResponse.status !== 200) {
        return "Updating transaction " + transactionNumber + " failed.\nTalk to Maor or something idk lol";
    }

    return ("Transaction number: " + transactionNumber + " was updated to status of " + statusWord[approvalStatus]);
}

export const reportNewTransactions = async (ctx:Context) => {
    try {
        const response = await axios.get(serverUrl + "notReportedToBot", {
        });
        sendReply(ctx, response);
    } catch (e) {
        ctx.reply("Something went wrong!");
    };

}
