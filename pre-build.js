'use strict';
var fs = require('fs');
var request = require('request');
var chalk = require('chalk');
var Mocha = require('mocha');
var mocha = new Mocha({ui: 'bdd', reporter: 'min'});
var build = require('./build.js');
var optipng = require('./lib/optipng');
var binPath = optipng.path;
var binUrl = optipng.url;

function runTest() {
	mocha.addFile('test/test-optipng-path.js');
	mocha.run(function (failures) {
		if (failures > 0) {
			console.log(chalk.red('pre-build test failed, compiling from source...'));
			build();
		} else {
			console.log(chalk.green('pre-build test passed successfully, skipping build...'));
		}
	});
}

if (fs.existsSync(binPath)) {
	runTest();
} else {
	request.get(binUrl)
		.pipe(fs.createWriteStream(binPath))
		.on('close', function () {
			fs.chmod(binPath, '0755');
			runTest();
		});
}
