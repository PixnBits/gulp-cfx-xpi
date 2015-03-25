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
	var dirsProcessing = [];

	function transform(chunk, encoding, callback) {
		var stream = this;
		var packageDir = path.dirname(chunk.path);

		if(!~dirsProcessing.indexOf(packageDir)){
			dirsProcessing.push(packageDir);

			process.chdir(cwd_cfx);

			var proc = cfx.xpi({ dir: packageDir, pkgdir: packageDir });
			proc.stderr.on('data', function (data) { 
				stream.emit('error', new PluginError('cfx', 'xpi, '+data));
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
					process.chdir(cwd_orig);
					stream.emit('error', new PluginError('cfx', 'xpi error ('+code+'): '+cfxXpiOut));
				}

				process.chdir(cwd_orig);
				callback();
			});

		}else{
			// gutil.warn(...)??
			// see https://github.com/gulpjs/gulp-util/issues/33
			gutil.log( gutil.colors.yellow(''+packageDir+' already being packaged') );
			callback();
		}
	}

	return through.obj(transform);
};

module.exports = cfxPackagePlugin;