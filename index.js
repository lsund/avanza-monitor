
import Avanza from 'avanza'
var config = require('./config');

const avanza = new Avanza()

const inserted = 7500;

avanza.authenticate({
    username: config.username,
    password: config.password
}).then(() => {
    const action = process.argv[2];
    if (action == 'summary') {
        avanza.getOverview().then(overview => {
            handleOverview(overview);
        });
    } else if (action == 'stocks') {
        avanza.getPositions().then(positions => {
            handlePositions(positions);
        });
    } else {
        console.log('Unknown action: ' + action);
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
};

var handlePositions = positions => {
    console.log('STOCKS\n');
    positions.map(position => {
        avanza.getStock(position.instrumentId).then(stock => {
            console.log('Name:        ' + stock.name);
            console.log('Volume     : ' + position.volume);
            console.log('Profit SEK : ' + position.profit);
            console.log('Profit %   : ' + position.profitPercent);
            console.log('---------------------------------------------------');
        });
    });
};


