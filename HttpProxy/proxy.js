var http = require('http'),
    net = require('net'),
    url = require('url');

function request(req, res) {
    console.log('Start request:', req.url);
    var options = url.parse(req.url);
    options.headers = req.headers;

    var proxyRequest = http.request(options, function (proxyResponse) {
        
        proxyResponse.on('data', function (chunk) {
            console.log('proxyResponse length:', chunk.length);
            res.write(chunk, 'binary');
        });

        proxyResponse.on('end', function () {
            console.log('proxied request ended');
            res.end();
        });

        proxyResponse.on('error', function () {
            console.log('proxied request error');
            res.end();
        });

        res.writeHead(proxyResponse.statusCode, proxyResponse.headers);
    });

    req.on('data', function (chunk) {
        console.log('in request length:', chunk.length);
        proxyRequest.write(chunk, 'binary');
    });

    req.on('end', function () {
        console.log('original request ended');
        proxyRequest.end();
    });

    req.on('error', function () {
        console.log('original request error');
        proxyRequest.end();
    });
}

function connect(req, clientSocket, bodyHead) {
    console.log('Start connect:', req.url);
    var options = url.parse('http://' + req.url);

    var proxySocket = net.connect(options.port, options.hostname, function () {
        console.log('Connection Established');
        proxySocket.write(bodyHead);
        clientSocket.write("HTTP/" + req.httpVersion + " 200 Connection Established\r\n\r\n");
        proxySocket.pipe(clientSocket);
    }).on('error', function () {
        clientSocket.end();
    });

    clientSocket.pipe(proxySocket);
}

// function connect(req, clientSocket, bodyHead) {
//     console.log('Start connect:', req.url);
//     var options = url.parse('http://' + req.url);

//     console.log(options.port);
//     console.log(bodyHead.toString());
//     var proxySocket = net.connect(options.port, options.hostname, function () {
//         console.log('Connection Established');
//         proxySocket.write(bodyHead);
//         clientSocket.write("HTTP/" + req.httpVersion + " 200 Connection Established\r\n\r\n");
//     });

//     proxySocket.on('data', function (chunk) {
//         console.log('in connection request length:', chunk.length);
//         clientSocket.write(chunk);
//     });

//     proxySocket.on('end', function () {
//         console.log('original connection request ended');
//         clientSocket.end();
//     });

//     proxySocket.on('error', function () {
//         clientSocket.write("HTTP/" + req.httpVersion + " 500 Connection error\r\n\r\n");
//         clientSocket.end();
//     });

//     clientSocket.on('data', function (chunk) {
//         proxySocket.write(chunk);
//     });

//     clientSocket.on('end', function () {
//         proxySocket.end();
//     });

//     clientSocket.on('error', function () {
//         proxySocket.end();
//     });
// }

http.createServer()
    .on('request', request)
    .on('connect', connect)
    .listen(8080);

console.log('Proxy Server is running');

