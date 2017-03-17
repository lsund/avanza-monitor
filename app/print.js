
'use strict';

var sprintf = require('sprintf-js').sprintf;
var util = require('./util');
var config = require('../config');

const fmtstr = '%-35s %-15s %-15s';

var isk = (isk) => {
    const diff = util.roundN(isk.ownCapital - config.inserted, 2);
    console.log('ISK\n');
    console.log('Number         : ' + isk.name);
    console.log('Balance        : ' + isk.totalBalance);
    console.log('Capital        : ' + isk.ownCapital);
    console.log('Performance %  : ' + util.roundN(isk.performancePercent, 2));
    console.log('Performance SEK: ' + util.roundN(isk.performance, 2));
    console.log('Profit SEK     : ' + isk.totalProfit);
    console.log('Profit %       : ' + isk.totalProfitPercent);
    console.log('Inserted diff  : ' + diff);
    console.log('------------------------------------------------------------');
};

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
module.exports.isk = isk;

