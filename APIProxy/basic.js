"use strict";

var fs = require('fs'),
    path = require('path');

var cache_path = './cache/';

function BasicStorage(options) {

    options = options || {};
    if ('cache_path' in options) {
        this.cachePath = options.cache_path;
    } else if ('user_id' in options) {
        this.cachePath = cache_path + user_id + '/';
    } else {
        this.cachePath = cache_path + '000000/';
    }
    this.cachePath = path.join(__dirname, this.cachePath);

    var self = this;
    fs.stat(this.cachePath, function (err, stats) {
        if (err) {
            console.info(err.message);
        }
        if (!stats || !stats.isDirectory()) {
            console.log('Create directory: ' + self.cachePath);
            fs.mkdir(self.cachePath);
        }
    });
}

BasicStorage.prototype.get = function (key, cb) {
    if (!isValidKey(key)) {
        throw new Error('Invalid key: ' + key);
    }

    cb = cb || function () {};
    var self = this;
    fs.stat(this.cachePath + key, function (err, stats) {
        if (stats && stats.isFile()) {
            return fs.readFile(self.cachePath + key, 'utf8', cb);
        }
        cb(null, false);
    });
};

BasicStorage.prototype.readStream = function(key, cb) {
    if (!isValidKey(key)) {
        throw new Error('Invalid key: ' + key);
    }

    cb = cb || function () {};
    var self = this;
    fs.stat(this.cachePath + key, function (err, stats) {
        if (!stats || !stats.isFile()) {
            return cb(null, false);
        }
        
        var opts = {
            flags: 'r',
            encoding: 'utf8'
        };
        var handle = fs.createReadStream(self.cachePath + key, opts);
        handle.on('open', function () {
            cb(null, handle);
        });
        handle.on('error', function (err) {
            cb(err, false);
        });
    });
};

BasicStorage.prototype.set = function(key, content, cb) {
    if (!isValidKey(key)) {
        throw new Error('Invalid key: ' + key);
    }

    fs.writeFile(this.cachePath + key, content, cb);
};

BasicStorage.prototype.writeStream = function (key, cb) {
    if (!isValidKey(key)) {
        throw new Error('Invalid key: ' + key);
    }

    cb = cb || function () {};
    var opts = {
        flags: 'w',
        encoding: 'utf8'
    };
    var handle = fs.createWriteStream(this.cachePath + key, opts);
    handle.on('open', function () {
        cb(null, handle);
    });
    handle.on('error', function (err) {
        cb(err, false);
    });
}

BasicStorage.prototype.remove = function (key, cb) {
    if (!isValidKey(key)) {
        throw new Error('Invalid key: ' + key);
    }

    cb = cb || function () {};
    var self = this;
    fs.stat(this.cachePath + key, function (err, stats) {
        if (err) {
            return cb(err, false);
        }
        if (stats && stats.isFile()) {
            fs.unlink(self.cachePath + key, cb);
        }
    });
};

function isValidKey(key) {
    return typeof key === 'string' && (/^[a-z0-9]+$/.test(key.toLowerCase()));
}

module.exports = BasicStorage;
