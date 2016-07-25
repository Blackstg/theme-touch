/***************************
 Money
 ***************************/

var Money = (function () {
    var UNKNOWN_CURRENCY = 'Unknown currency: ';

    var toString = function (cents, currency, locale) {
        if (cents === null) return '';
        var sign = cents >= 0 ? '' : '-';
        var decimal = '' + (Math.abs(cents) / 100).toFixed(2);
        switch (currency) {
            case 'AED':
                return sign + decimal + '&nbsp;AED';
            case 'BRL':
                return sign + 'R' + '&nbsp;' + decimal;
            case 'CAD':
                return sign + '$' + '&nbsp;' + decimal;
            case 'CHF':
                return sign + decimal + '&nbsp;CHF';
            case 'EUR':
                if (locale == 'nl-NL')
                    return sign + '€&nbsp;' + decimal;
                else
                    return sign + decimal + '&nbsp;€';
            case 'GBP':
                return sign + '£' + '&nbsp;' + decimal;
            case 'UAH':
                return sign + decimal + '&nbsp;грн';
            case 'RUB':
                return sign + decimal + '&nbsp;руб';
            case 'TND':
                return sign + decimal + '&nbsp;DT';
            case 'USD':
                return sign + '$' + '&nbsp;' + decimal;
            default:
                return console.warn(UNKNOWN_CURRENCY + currency);
        }
    }

    return {
        toString: toString
    }
})();