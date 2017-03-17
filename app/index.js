
'use strict';

import Avanza from 'avanza';
var config = require('../config');
var print = require('./print');
var util = require('./util');

const avanza = new Avanza();

avanza.authenticate({
    username: config.username,
    password: config.password
}).then(() => {
    const action = process.argv[2];
    if (action === 'summary') {
        avanza.getOverview().then(overview => {
            handleOverview(overview);
        });
    } else if (action === 'positions') {
        avanza.getPositions().then(avanza_positions => {
            handlePositions(avanza_positions);
        });
    } else {
        console.log('usage: ./index.js summary|positions');
        process.exit();
    }
});

var handleOverview = overview => {
    var isk = overview.accounts.filter(account => {
        return account.accountType === 'Investeringssparkonto';
    })[0];
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
    process.exit();
};

var pushStock = (item, resolve, positions) => {
    avanza.getStock(item.instrumentId).then(avanza_position => {
        resolve();
        let position = {
            is_fund           : avanza_position.marketPlace === 'Fondmarknaden',
            name               : avanza_position.name,
            volume             : item.volume,
            price              : avanza_position.lastPrice,
            profitTodayPercent : avanza_position.changePercent,
            profitToday        : avanza_position.change,
            profit             : item.profit,
            profitPercent      : item.profitPercent
        };
        positions.push(position);
    });
};

var calcAvg = (stocks) => {
    const sumToday = stocks.reduce((acc, position) => {
        return position.profitTodayPercent + acc;
    }, 0);
    const sumTotal = stocks.reduce((acc, position) => {
        return position.profitPercent + acc;
    }, 0);
    return [sumToday / stocks.length, sumTotal / stocks.length];
};

var handlePositions = (avanza_positions) => {
    let positions = [];
    let requests = avanza_positions.map((avanza_position) => {
        return new Promise((resolve) => {
            pushStock(avanza_position, resolve, positions);
        });
    });
    Promise.all(requests).then(() => {
        let stocks = positions.filter((element) => {
            return !element.is_fund;
        });
        let funds = positions.filter((element) => {
            return element.is_fund;
        });
        stocks.sort((a, b) => {
            if (a.profitPercent > b.profitPercent) {
                return -1;
            } else {
                return 1;
            }
        });

        print.stocks(stocks);

        print.average(calcAvg(stocks));

        print.funds(funds);

        process.exit();
    });
};

