
import Avanza from 'avanza'
var config = require('./config');

const avanza = new Avanza()

const action = 'positions'

avanza.authenticate({
    username: config.username,
    password: config.password
}).then(() => {
    if (action == 'overview') {
        avanza.getOverview().then(overview => {
            handleOverview(overview);
        });
    } else {
        avanza.getPositions().then(positions => {
            handlePositions(positions);
        });
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


