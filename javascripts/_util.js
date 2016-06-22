/*****************************
 Util
 *****************************/
var Util = (function () {
    return {
        addKeyValueToURL: function (url, key, value) {
            return Util.addParametersToURL(url, key + '=' + encodeURI(value))
        },

        addParametersToURL: function (url, p) {
            return url + (url.split('?')[1] ? '&' : '?') + p;
        },

        getParameterFromUrl: function (url, key) {
            var search = url.split('?')[1],
                key_values = decodeURIComponent(search || '').split('&');

            for (var i = 0; i < key_values.length; i++) {
                var key_value = key_values[i].split('=');

                if (key_value[0] === key) {
                    return key_value[1] === undefined ? true : key_value[1];
                }
            }
        },

        removeKeyFromUrl: function (url, key) {
            var url_parts = url.split('?');
            if (url_parts.length >= 2) {
                var prefix = encodeURIComponent(key) + '=';
                var parameters = url_parts[1].split(/[&;]/g);

                // Reverse iteration as may be destructive
                for (var i = parameters.length; i-- > 0;) {
                    // Idiom for string.startsWith
                    if (parameters[i].lastIndexOf(prefix, 0) !== -1) {
                        parameters.splice(i, 1);
                    }
                }

                url = url_parts[0] + (parameters.length > 0 ? '?' + parameters.join('&') : "");
                return url;
            } else {
                return url;
            }
        }
    }
}());