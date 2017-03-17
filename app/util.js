
'use strict';

var roundN = (number, n) => {
    const multiplyer = Math.pow(10, n);
    return Math.round(number * multiplyer) / multiplyer;
};

module.exports.roundN = roundN;

