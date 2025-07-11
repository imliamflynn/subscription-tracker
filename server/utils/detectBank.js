function detectBank(columns) {
    const lowerCols = columns.map(c => c.toLowerCase());

    if (lowerCols.includes('other party') && lowerCols.includes('analysis code')) {
        return 'Westpac';
    }

    if (lowerCols.includes('code') && lowerCols.includes('foreigncurrencyamount')) {
        return 'ANZ';
    }

    return 'Unknown Bank';
}

module.exports = detectBank;