
'use strict';

import Avanza from 'avanza';
var config = require('./config');
var util = require('util');
var sprintf = require('sprintf-js').sprintf;

const avanza = new Avanza();

const verbose = false;

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
    const diff = roundN(isk.ownCapital - config.inserted, 2);
    console.log('ISK\n');
    console.log('Number         : ' + isk.name);
    console.log('Balance        : ' + isk.totalBalance);
    console.log('Capital        : ' + isk.ownCapital);
    console.log('Performance %  : ' + roundN(isk.performancePercent, 2));
    console.log('Performance SEK: ' + roundN(isk.performance, 2));
    console.log('Profit SEK     : ' + isk.totalProfit);
    console.log('Profit %       : ' + isk.totalProfitPercent);
    console.log('Inserted diff  : ' + diff);
    console.log('------------------------------------------------------------');
    process.exit();
};

var pushStock = (item, resolve, stocks) => {
    avanza.getStock(item.instrumentId).then(avanza_stock => {
        resolve();
        let stock = {
            name               : avanza_stock.name,
            volume             : item.volume,
            price              : avanza_stock.lastPrice,
            profitTodayPercent : avanza_stock.changePercent,
            profitToday        : avanza_stock.change,
            profit             : item.profit,
            profitPercent      : item.profitPercent
        };
        stocks.push(stock);
    });
};

var handlePositions = positions => {
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
        console.log(sprintf(
                '%-22s %-15s %-15s',
                'STOCK',
                'TODAY',
                'TOTAL'
            )
        );
        stocks.map(stock => {
            if (!verbose) {
                const rep = sprintf(
                                '%-22s %-15s %-15s',
                                stock.name,
                                stock.profitTodayPercent,
                                stock.profitPercent
                            );
                console.log(rep);
            } else {
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
            }
        });
        const sumToday = stocks.reduce((acc, stock) => {
            return stock.profitTodayPercent + acc;
        }, 0);
        const sumTotal = stocks.reduce((acc, stock) => {
            return stock.profitPercent + acc;
        }, 0);
        const avgToday = sumToday / stocks.length;
        const avgTotal = sumTotal / stocks.length;
        console.log('-----------------------------------------');
        console.log(sprintf('%-22s %-15s %-15s',
                            'Average',
                            roundN(avgToday, 2),
                            roundN(avgTotal, 2)));
        process.exit();
    });
};

