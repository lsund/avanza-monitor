
'use strict';

var average = (stocks) => {
    const sumToday = stocks.reduce((acc, position) => {
        return position.profitTodayPercent + acc;
    }, 0);
    const sumTotal = stocks.reduce((acc, position) => {
        return position.profitPercent + acc;
    }, 0);
    return [sumToday / stocks.length, sumTotal / stocks.length];
};

var roundN = (number, n) => {
    const multiplyer = Math.pow(10, n);
    return Math.round(number * multiplyer) / multiplyer;
};

module.exports.roundN = roundN;
module.exports.average = average;

