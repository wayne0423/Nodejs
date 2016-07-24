var http = require('http'),
    https = require('https'),
    url = require('url');

var request;

function Request() {
    this.maxRedirects = 10;
    this.redirects = 0;
}

Request.prototype.get = function (href, callback) {

    var uri = url.parse(href);
    var options = {host: uri.host, path: uri.path};
    var httpGet = uri.protocol === 'http' ? http.get : https.get;

    console.log('Get:', href);

    function processResponse(response) {
        if (response.statusCode >= 300 && response.statusCode < 400) {
            if (this.redirects >= this.maxRedirects) {
                this.error = new Error('Too many redirects for:' + href);
            } else {
                this.redirects++;
                href = url.resolve(options.host, response.headers.location);
                return this.get(href, callback);
            }
        }

        response.url = href;
        response.redirects = this.redirects;

        console.log('Redirected:', href);

        function end() {
            console.log('Connection ended');
            callback(this.error, response);
        }

        response.on('data', function (data) {
            console.log('Get data, length:', data.length);
        });

        response.on('end', end.bind(this));
    }

    httpGet(options, processResponse.bind(this))
        .on('error', function (err) {
            callback(err);
        });
};

request = new Request();
request.get('http://baidu.com', function (err, res) {
    if (err) {
        console.error(err);
    } else {
        console.log('Fetched URL:', res.url, 'with', res.redirects, 'redirects');
        process.exit();
    }
});

