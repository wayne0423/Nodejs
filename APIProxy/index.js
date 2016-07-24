var http = require('http');
var fs = require('fs');

storage = new (require('./basic'));

var meta = {
    "firstName":"Wayne",
    "lastName":"Zhu",
};


storage.set('111', JSON.stringify(meta, null, '\t'));


storage.get('111', function (err, res) {
    console.log(res);
});


storage.writeStream('222', function (err, handle) {
    if (handle) {
        http.get('http://www.baidu.com', function (res) {
            res.pipe(handle);
        }).on('error', function (e) {
            console.log('Get error:' + e.message);
        }).on('close', function () {
            storage.get('222', function (err, res) {
                console.log(res);
            });
        });
    }
});

storage.readStream('111', function (err, handle1) {
    if (handle1) {
        storage.writeStream('333', function (err, handle2) {
            if (handle2) {
                handle1.pipe(handle2).on('close', function () {
                    storage.get('333', function (err, res) {
                        console.log('readStream & writeStream')
                        console.log(res);
                    });
                });
            }
        });
    }
});

