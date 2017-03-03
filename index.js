
'use strict';

import Avanza from 'avanza';
var config = require('./config');

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
    console.log('STOCKS\n');
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
            console.log('Name             : ' + stock.name);
            console.log('Volume           : ' + stock.volume);
            console.log('Latest Price     : ' + stock.price);
            console.log('Profit Today SEK : ' + stock.profitToday);
            console.log('Profit Today %   : ' + stock.profitTodayPercent);
            console.log('Profit Total SEK : ' + stock.profit);
            console.log('Profit Total %   : ' + stock.profitPercent);
            console.log('---------------------------------------------------');
        });
        process.exit();
    });
};

