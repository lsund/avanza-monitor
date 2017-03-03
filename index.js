
'use strict';

import Avanza from 'avanza';
var config = require('./config');
var util = require('util');

const avanza = new Avanza();

const inserted = 7500;

avanza.authenticate({
    username: config.username,
    password: config.password
}).then(() => {
    const action = process.argv[2];
    if (action === 'summary') {
        avanza.getOverview().then(overview => {
            handleOverview(overview);
        });
    } else if (action === 'stocks') {
        avanza.getPositions().then(positions => {
            handlePositions(positions);
        });
    } else {
        console.log('usage: ./index.js summary|stocks');
        process.exit();
    }
});

var roundN = (number, n) => {
    const multiplyer = Math.pow(10, n);
    return Math.round(number * multiplyer) / multiplyer;
};

var handleOverview = overview => {
    var isk = overview.accounts.filter(account => {
        return account.accountType === 'Investeringssparkonto';
    })[0];
    console.log('ISK\n');
    console.log('Number         : ' + isk.name);
    console.log('Balance        : ' + isk.totalBalance);
    console.log('Capital        : ' + isk.ownCapital);
    console.log('Performance %  : ' + roundN(isk.performancePercent, 2));
    console.log('Performance SEK: ' + roundN(isk.performance, 2));
    console.log('Profit         : ' + isk.totalProfit);
    console.log('Inserted diff  : ' + roundN(isk.ownCapital - inserted, 2));
    console.log('------------------------------------------------------------');
    process.exit();
};

var pushStock = (item, resolve, stocks) => {
    avanza.getStock(item.instrumentId).then(avanza_stock => {
        resolve();
        let stock = {
            name: avanza_stock.name,
            volume: item.volume,
            price: avanza_stock.lastPrice,
            profitTodayPercent: avanza_stock.changePercent,
            profitToday: avanza_stock.change,
            profit: item.profit,
            profitPercent: item.profitPercent
        };
        stocks.push(stock);
    });
};

var handlePositions = positions => {
    console.log('STOCKS');
    let stocks = [];
    let requests = positions.map((avanza_position) => {
        return new Promise((resolve) => {
            pushStock(avanza_position, resolve, stocks);
        });
    });
    Promise.all(requests).then(() => {
        stocks.sort((a, b) => {
            if (a.profitTodayPercent > b.profitTodayPercent) {
                return -1;
            } else {
                return 1;
            }
        });
        stocks.map(stock => {
            const name = util.format(
                            '%s (%s) %s SEK',
                            stock.name,
                            stock.volume,
                            stock.price
                        ); 
            const profitToday = util.format(
                                    'Today\t| %s %%\t| %s SEK\t|', 
                                    stock.profitTodayPercent,
                                    stock.profitToday
                                );
            const profit = util.format(
                                    'Total\t| %s %%\t| %s SEK\t|', 
                                    stock.profitPercent,
                                    stock.profit
                                );
            console.log();
            console.log(name);
            console.log('-----------------------------------------');
            console.log(profitToday);
            console.log(profit);
            console.log('-----------------------------------------');
        });
        process.exit();
    });
};

