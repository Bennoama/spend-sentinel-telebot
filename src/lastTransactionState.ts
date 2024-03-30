import fs from 'fs'
// this file should be linked to the file from scraper or vice versa
const filePath = "./lastTransactionDate.txt";

export const getLastTransactionDate = ():Date => {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, "0");
    }
    const data = fs.readFileSync(filePath);
    if (!data) {
      return new Date(0);
    }
    return new Date(+data);
  }
  
export const updateLatestTransactionDate = (latestTransactionDate: Date) => {
    fs.writeFileSync(filePath, (1000 + latestTransactionDate.getTime()).toString())  
  }