/*!
 * Lightweight URL manipulation with JavaScript
 * https://github.com/Mikhus/domurl
 * Version 2.1 (13/7/2016)
 * @license MIT
 * @author Mykhailo Stadnyk <mikhus@gmail.com>
 */
(function (ns) {
    'use strict';

    // mapping between what we want and <a> element properties
    var map = {
        protocol: 'protocol',
        host: 'hostname',
        port: 'port',
        path: 'pathname',
        query: 'search',
        hash: 'hash'
    };

    // jscs: disable
    /**
     * default ports as defined by http://url.spec.whatwg.org/#default-port
     * We need them to fix IE behavior, @see https://github.com/Mikhus/jsurl/issues/2
     */
    // jscs: enable
    var defaultPorts = {
        ftp: 21,
        gopher: 70,
        http: 80,
        https: 443,
        ws: 80,
        wss: 443
    };

    function parse (self, url) {
        var currUrl, link, i, auth;

        if (typeof document === 'undefined' && typeof require === 'function') {
            currUrl = 'file://' +
                (process.platform.match(/^win/i) ? '/' : '') +
                require('fs').realpathSync('.');

            if (url && url.charAt(0) !== '/' && !url.match(/^\w+:\/\//)) {
                url = currUrl + require('path').sep + url;
            }

            link = require('url').parse(url || currUrl);
        }

        else {
            currUrl = document.location.href;
            link = document.createElement('a');
            link.href = url || currUrl;
        }

        auth = (url || currUrl).match(/\/\/(.*?)(?::(.*?))?@/) || [];

        for (i in map) {
            self[i] = link[map[i]] || '';
        }

        // fix-up some parts
        self.protocol = self.protocol.replace(/:$/, '');
        self.query = self.query.replace(/^\?/, '');
        self.hash = decode(self.hash.replace(/^#/, ''));
        self.user = decode(auth[1] || '');
        self.pass = decode(auth[2] || '');
        self.port = (
            // loosely compare because port can be a string
            defaultPorts[self.protocol] == self.port || self.port == 0
        ) ? '' : self.port; // IE fix, Android browser fix

        if (!self.protocol && !/^([a-z]+:)?\/\/\/?/.test(url)) {
            // is IE and path is relative
            var base = new DomUrl(currUrl.match(/(.*\/)/)[0]);
            var basePath = base.path.split('/');
            var selfPath = self.path.split('/');
            var props = ['protocol', 'user', 'pass', 'host', 'port'];
            var s = props.length;

            basePath.pop();

            for (i = 0; i < s; i++) {
                self[props[i]] = base[props[i]];
            }

            while (selfPath[0] == '..') { // skip all "../
                basePath.pop();
                selfPath.shift();
            }

            self.path =
                (url.charAt(0) != '/' ? basePath.join('/') : '') +
                '/' + selfPath.join('/')
            ;
        }

        else {
            // fix absolute URL's path in IE
            self.path = self.path.replace(/^\/?/, '/');
        }

        self.paths((self.path.charAt(0) == '/' ?
            self.path.slice(1) : self.path).split('/')
        );

        self.query = new QueryString(self.query);
    }

    function encode (s) {
        return encodeURIComponent(s).replace(/'/g, '%27');
    }

    function decode (s) {
        s = s.replace(/\+/g, ' ');

        s = s.replace(/%([ef][0-9a-f])%([89ab][0-9a-f])%([89ab][0-9a-f])/gi,
            function (code, hex1, hex2, hex3) {
                var n1 = parseInt(hex1, 16) - 0xE0;
                var n2 = parseInt(hex2, 16) - 0x80;

                if (n1 === 0 && n2 < 32) {
                    return code;
                }

                var n3 = parseInt(hex3, 16) - 0x80;
                var n = (n1 << 12) + (n2 << 6) + n3;

                if (n > 0xFFFF) {
                    return code;
                }

                return String.fromCharCode(n);
            }
        );

        s = s.replace(/%([cd][0-9a-f])%([89ab][0-9a-f])/gi,
            function (code, hex1, hex2) {
                var n1 = parseInt(hex1, 16) - 0xC0;

                if (n1 < 2) {
                    return code;
                }

                var n2 = parseInt(hex2, 16) - 0x80;

                return String.fromCharCode((n1 << 6) + n2);
            }
        );

        return s.replace(/%([0-7][0-9a-f])/gi,
            function (code, hex) {
                return String.fromCharCode(parseInt(hex, 16));
            }
        );
    }

    /**
     * Class QueryString
     *
     * @param {string} qs - string representation of QueryString
     * @constructor
     */
    function QueryString (qs) {
        var re = /([^=&]+)(=([^&]*))?/g;
        var match;

        while ((match = re.exec(qs))) {
            var key = decodeURIComponent(match[1].replace(/\+/g, ' '));
            var value = match[3] ? decode(match[3]) : '';

            if (!(this[key] === undefined || this[key] === null)) {
                if (!(this[key] instanceof Array)) {
                    this[key] = [this[key]];
                }

                this[key].push(value);
            }

            else {
                this[key] = value;
            }
        }
    }

    /**
     * Converts QueryString object back to string representation
     *
     * @returns {string}
     */
    QueryString.prototype.toString = function () {
        var s = '';
        var e = encode;
        var i, ii;

        for (i in this) {
            if (this[i] instanceof Function || this[i] === null) {
                continue;
            }

            if (this[i] instanceof Array) {
                var len = this[i].length;

                if (len) {
                    for (ii = 0; ii < len; ii++) {
                        s += s ? '&' : '';
                        s += e(i) + '=' + e(this[i][ii]);
                    }
                }

                else {
                    // parameter is an empty array, so treat as
                    // an empty argument
                    s += (s ? '&' : '') + e(i) + '=';
                }
            }

            else {
                s += s ? '&' : '';
                s += e(i) + '=' + e(this[i]);
            }
        }

        return s;
    };

    /**
     * Class DomUrl
     *
     * @param {string} [url] - string URL representation
     * @constructor
     */
    function DomUrl (url) {
        parse(this, url);
    }

    /**
     * Clears QueryString, making it contain no params at all
     *
     * @returns {DomUrl}
     */
    DomUrl.prototype.clearQuery = function () {
        for (var key in this.query) {
            if (!(this.query[key] instanceof Function)) {
                delete this.query[key];
            }
        }

        return this;
    };

    /**
     * Returns total number of parameters in QueryString
     *
     * @returns {number}
     */
    DomUrl.prototype.queryLength = function () {
        var count = 0;
        var key;

        for (key in this) {
            if (!(this[key] instanceof Function)) {
                count++;
            }
        }

        return count;
    };

    /**
     * Returns true if QueryString contains no parameters, false otherwise
     *
     * @returns {boolean}
     */
    DomUrl.prototype.isEmptyQuery = function () {
        return this.queryLength() === 0;
    };

    /**
     *
     * @param {Array} [paths] - an array pf path parts (if given will modify
     *                          DomUrl.path property
     * @returns {Array} - an array representation of the DomUrl.path property
     */
    DomUrl.prototype.paths = function (paths) {
        var prefix = '';
        var i = 0;
        var s;

        if (paths && paths.length && paths + '' !== paths) {
            if (this.isAbsolute()) {
                prefix = '/';
            }

            for (s = paths.length; i < s; i++) {
                paths[i] = !i && paths[i].match(/^\w:$/) ? paths[i] :
                    encode(paths[i]);
            }

            this.path = prefix + paths.join('/');
        }

        paths = (this.path.charAt(0) === '/' ?
            this.path.slice(1) : this.path).split('/');

        for (i = 0, s = paths.length; i < s; i++) {
            paths[i] = decode(paths[i]);
        }

        return paths;
    };

    /**
     * Performs URL-specific encoding of the given string
     *
     * @method DomUrl#encode
     * @param {string} s - string to encode
     * @returns {string}
     */
    DomUrl.prototype.encode = encode;

    /**
     * Performs URL-specific decoding of the given encoded string
     *
     * @method DomUrl#decode
     * @param {string} s - string to decode
     * @returns {string}
     */
    DomUrl.prototype.decode = decode;

    /**
     * Checks if current URL is an absolute resource locator (globally absolute
     * or absolute path to current server)
     *
     * @returns {boolean}
     */
    DomUrl.prototype.isAbsolute = function () {
        return this.protocol || this.path.charAt(0) === '/';
    };

    /**
     * Returns string representation of current DomUrl object
     *
     * @returns {string}
     */
    DomUrl.prototype.toString = function () {
        return (
            (this.protocol && (this.protocol + '://')) +
            (this.user && (
            encode(this.user) + (this.pass && (':' + encode(this.pass))
            ) + '@')) +
            (this.host && this.host) +
            (this.port && (':' + this.port)) +
            (this.path && this.path) +
            (this.query.toString() && ('?' + this.query)) +
            (this.hash && ('#' + encode(this.hash)))
        );
    };

    ns[ns.exports ? 'exports' : 'DomUrl'] = DomUrl;
}(typeof module !== 'undefined' && module.exports ? module : window));