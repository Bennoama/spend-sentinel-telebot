import axios, { AxiosError, AxiosResponse } from "axios";
import { Context } from "telegraf";
import { getLastTransactionDate, updateLatestTransactionDate } from "./lastTransactionState"; // TODO - needs to be linked to same file as scraper
import { serverUrl, transactionsSinceSuffix } from "../../transaction-api/src/shared/routeNames";  // TODO needs to be linked to backend routeNames
import { ApprovalStatus, MoneyTransaction } from "../../transaction-api/src/shared/types"; // TODO needs to be linked to backend types

const sendReply = (ctx:Context, response:AxiosResponse<any, any>, time:number) => {
    const moneyTransactions:MoneyTransaction[] = response.data;
    let i = 0;
    let latestTransactionTime = time;
    moneyTransactions.forEach((transaction:MoneyTransaction) => {
        const transactionTime = (new Date(transaction.TransactionDate)).getTime();
        latestTransactionTime = transactionTime > latestTransactionTime ? transactionTime : latestTransactionTime;
        const data = getRelevantData(transaction);
        try {
            ctx.reply("*New transaction found:*\n" + JSON.stringify(data, null, 1).replace(/[{"'}]/g,''));
        } catch (e:any) {
            console.log("Failed to send reply in chat, transaction number:", transaction.TransNum);
        }
    });

    console.log("Done");
    updateLatestTransactionDate(new Date(latestTransactionTime));
}

const getRelevantData = (transaction: MoneyTransaction):Record<string, any> => {
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
    const time = getLastTransactionDate().getTime();
    try {
        const response = await axios.get(serverUrl + transactionsSinceSuffix, {
            params: {time : time}
        });
        sendReply(ctx, response, time);
    } catch (e) {
        ctx.reply("Something went wrong!");
    };

}