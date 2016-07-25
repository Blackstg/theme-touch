/*****************************
 Util
 *****************************/
var Util = (function () {
    return {
        addKeyValueToURL: function (url, key, value) {
            var dom_url = new DomUrl(url);
            dom_url.query[key] = value;
            return dom_url.toString();
        },

        addParametersToURL: function (url, parameters) {
            var dom_url = new DomUrl(url);
            $j.each(parameters.split('&'), function () {
                var key_value = this.split('='),
                    key = key_value[0],
                    value = key_value[1];
                dom_url.query[key] = value;
            });
            return dom_url.toString();
        },

        getParameterFromUrl: function (url, key) {
            var dom_url = new DomUrl(url);
            return dom_url.query[key];
        },

        removeKeyFromUrl: function (url, key) {
            var dom_url = new DomUrl(url);
            delete dom_url.query[key];
            return dom_url.toString();
        }
    }
}());