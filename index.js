
'use strict';

import Avanza from 'avanza';
var config = require('./config');
var sprintf = require('sprintf-js').sprintf;

const avanza = new Avanza();
const fmtstr = '%-35s %-15s %-15s';


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

var calcAvg = (stocks) => {
    const sumToday = stocks.reduce((acc, position) => {
        return position.profitTodayPercent + acc;
    }, 0);
    const sumTotal = stocks.reduce((acc, position) => {
        return position.profitPercent + acc;
    }, 0);
    return [sumToday / stocks.length, sumTotal / stocks.length];
};

var printStocks = (stocks) => {
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

var printAverage = (avg) => {
    console.log('--------------------------------------------------------');
    console.log(sprintf(fmtstr,
                        'Average',
                        roundN(avg[0], 2),
                        roundN(avg[1], 2)));
    console.log('--------------------------------------------------------');

};

var printFunds = (funds) => {
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

        printStocks(stocks);

        printAverage(calcAvg(stocks));

        printFunds(funds);

        process.exit();
    });
};

