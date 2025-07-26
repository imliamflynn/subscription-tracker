const categoryMap = require('./categoryMap');

function getCategory(vendor) {
    const lowerVendor = vendor.toLowerCase();

    for (const [category, keywords] of Object.entries(categoryMap)) {
        for (const keyword of keywords) {
            if (lowerVendor.includes(keyword)) {
                return category.charAt(0).toUpperCase() + category.slice(1); // Capitalized
            }
        }
    }

    return 'Other';
}

module.exports = getCategory;