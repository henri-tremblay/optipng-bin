'use strict';
var exec = require('child_process').exec;
var path = require('path');
var os = require('os');
var which = require('which');
var chalk = require('chalk');
var tar = require('tar');
var request = require('request');
var zlib = require('zlib');
var binPath = require('./lib/optipng').path;
var tmpdir = os.tmpdir ? os.tmpdir() : os.tmpDir();
var version = '0.7.4';
var tmpPath = path.join(tmpdir, 'optipng-' + version);
var urlPath = 'http://downloads.sourceforge.net/project/optipng/OptiPNG/optipng-' + version + '/optipng-' + version + '.tar.gz';

module.exports = function () {
	if (!(process.platform === 'darwin' || process.platform === 'linux')) {
		return;
	}

	var opts = {
		type: 'Directory',
		path: tmpPath,
		strip: 1
	};

	var proxy = process.env.http_proxy || process.env.HTTP_PROXY ||
		process.env.https_proxy || process.env.HTTPS_PROXY || '';

	console.log(chalk.yellow('Fetching %s...'), urlPath);

	var req = request.defaults({ proxy: proxy }).get(urlPath, function (err, resp) {
		if (resp.statusCode !== 200) {
			throw err;
		}
	});

	req
		.pipe(zlib.Gunzip())
		.pipe(tar.Extract(opts))
		.on('close', function () {
			console.log(chalk.green('Done in %s'), tmpPath);

			which('make', function (err) {
				if (err) {
					throw err;
				}

				console.log(chalk.yellow('\nBuilding OptiPNG...'));
				var binDir = path.dirname(binPath);
				var buildScript = './configure --with-system-zlib --bindir=' + binDir + ' --mandir=man && ' +
								  'make install';
				exec(buildScript, { cwd: tmpPath }, function (err) {
					if (err) {
						throw err;
					}

					console.log(chalk.green('OptiPNG rebuilt successfully'));
				});
			});
		});
};
