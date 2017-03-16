
'use strict';

import Avanza from 'avanza';
var config = require('./config');
var sprintf = require('sprintf-js').sprintf;

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

var handlePositions = avanza_positions => {
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
            if (a.profitTodayPercent > b.profitTodayPercent) {
                return -1;
            } else {
                return 1;
            }
        });
        const fmtstr = '%-35s %-15s %-15s';
        console.log(sprintf(
                fmtstr,
                'STOCK',
                'TODAY',
                'TOTAL'
            )
        );
        stocks.map(position => {
            const rep = sprintf(
                            fmtstr,
                            position.name,
                            position.profitTodayPercent,
                            position.profitPercent
                        );
            console.log(rep);
        });
        const sumToday = stocks.reduce((acc, position) => {
            return position.profitTodayPercent + acc;
        }, 0);
        const sumTotal = stocks.reduce((acc, position) => {
            return position.profitPercent + acc;
        }, 0);
        const avgToday = sumToday / stocks.length;
        const avgTotal = sumTotal / stocks.length;
        console.log('--------------------------------------------------------');
        console.log(sprintf(fmtstr,
                            'Average',
                            roundN(avgToday, 2),
                            roundN(avgTotal, 2)));
        console.log('--------------------------------------------------------');
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
        process.exit();
    });
};

