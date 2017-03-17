
'use strict';

var sprintf = require('sprintf-js').sprintf;
var util = require('./util');

const fmtstr = '%-35s %-15s %-15s';

var average = (avg) => {
    console.log('--------------------------------------------------------');
    console.log(sprintf(fmtstr,
                        'Average',
                        util.roundN(avg[0], 2),
                        util.roundN(avg[1], 2)));
    console.log('--------------------------------------------------------');
};

var stocks = (stocks) => {
    console.log(sprintf(
            fmtstr,
            'STOCK',
            'TODAY',
            'TOTAL'
        )
    );
    stocks.map(stock => {
        const rep = sprintf(
                        fmtstr,
                        stock.name,
                        stock.profitTodayPercent,
                        stock.profitPercent
                    );
        console.log(rep);
    });
};

var funds = (funds) => {
    console.log(sprintf(
            fmtstr,
            'FUND',
            'TODAY',
            'TOTAL'
        )
    );
    funds.map(position => {
        const rep = sprintf(
                        fmtstr,
                        position.name,
                        position.profitTodayPercent,
                        position.profitPercent
                    );
        console.log(rep);
    });
};

module.exports.funds = funds;
module.exports.average = average;
module.exports.stocks = stocks;

