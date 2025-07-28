const { parse } = require('date-fns');
const getCategory = require('./getCategory');

function parseANZRow(row) {
    return {
        code: row['Code'],
        details: row['Details'],
        amount: parseFloat(row['Amount']),
        date: parse(row['Date'], 'dd/MM/yyyy', new Date()),
        vendor: getVendor(row['Code'], row['Details']),
        //category: getCategory(getVendor(row['Code'], row['Details'])),
    };
}

function parseWestpacRow(row) {
    return {
        code: row['Other Party'],
        details: row['Particulars'],
        amount: parseFloat(row['Amount']),
        date: parse(row['Date'], 'dd/MM/yyyy', new Date()),
        vendor: getVendor(row['Other Party'], row['Particulars']),
        //category: getCategory(getVendor(row['Other Party'], row['Particulars'])),
    };
}

function getVendor(code, details) {
    // Remove card number garbage
    const cardPattern = /^(\d{4}-\*{4}-\*{4}-\d{4})/;
    const knownJunk = ['df', 'if', 'c']; // anything else you want to filter

    const clean = (str) =>
        str
            //?.toLowerCase()
            //.replace(/[^a-z0-9\s]/gi, '') // remove punctuation
            //.replace(/\s+/g, ' ') // collapse whitespace
            .replace(cardPattern, '') // remove card number pattern
            .replace(/^\*+$/, '') // remove strings that are just asterisks
            .replace(/\d+/g, '')
            .trim();

    const cleanedCode = clean(code);
    const cleanedDetails = clean(details);

    if (cleanedCode == "Transfer") return cleanedCode;
    if (cleanedDetails == "Auto payment") return cleanedCode;

    // If details is cleaner (longer and non-junk), prefer it
    if (cleanedDetails && cleanedDetails.length > cleanedCode.length && !knownJunk.includes(cleanedDetails)) {
        return cleanedDetails;
    }

    // Otherwise fallback to code
    return cleanedCode;
}

module.exports = {
    parseANZRow,
    parseWestpacRow,
};