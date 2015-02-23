'use strict';

var path = require('path');
var fs = require('fs');

var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var File = gutil.File;

// cfx messes with the cwd :'(
var cwd_orig = process.cwd();
var cfx = require('cfx');
var cwd_cfx = process.cwd();
process.chdir(cwd_orig);

var cfxPackagePlugin = function() {
	var packageDirs = [];

	function transform(chunk, encoding, callback) {
		var chunkDir = path.dirname(chunk.path);
		if(!~packageDirs.indexOf(chunkDir)){
			packageDirs.push(chunkDir);
		}
		callback();
	}

	function flush(callback){
		var stream = this;
		var finished = [];

		if(!packageDirs.length){
			return callback();
		}

		process.chdir(cwd_cfx);
		
		packageDirs.forEach(function(packageDir){

			var proc = cfx.xpi({ dir: packageDir, pkgdir: packageDir });
			proc.stderr.on('data', function (data) { 
				throw new PluginError('cfx',{
					message: 'xpi, '+data
				});
			});

			// keep track of what xpi is creating (ex: "Exporting extension to src.xpi.")
			var cfxXpiOut = '';
			proc.stdout.on('data', function (data) { cfxXpiOut+=data; });
			proc.on('close', function (code) {
				if (!code){
					var xpiFileName = /\s([^\s]*)\.xpi/.exec(cfxXpiOut)[1],
						xpiFilePath = path.join(packageDir, xpiFileName+'.xpi');

					stream.push(
						new File({
							base: packageDir,
							cwd: packageDir,
							path: xpiFilePath,
							contents: fs.readFileSync(xpiFilePath)
						})
					);
					fs.unlink(xpiFilePath);
					
				}else{
					throw new PluginError('cfx',{
						message: 'xpi error ('+code+')'
					});
				}

				finished.push(code);
				if(finished.length === packageDirs.length){
					process.chdir(cwd_orig);
					callback();
				}
			});
		});

		
	}

	return through.obj(transform, flush);
};

module.exports = cfxPackagePlugin;