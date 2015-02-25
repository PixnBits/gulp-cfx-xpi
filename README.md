[gulp-cfx-xpi](https://www.npmjs.com/package/gulp-cfx-xpi)
============

Package Firefox Add-ons.

Install
=======
```bash
npm install gulp-cfx-xpi --save
```

Usage
=====

```javascript
var xpi = require('gulp-cfx-xpi');

...

gulp.task('single', function(){
  gulp.src('./src')
    .pipe(xpi())
    .pipe(gulp.dest('./build/'));
});

gulp.task('multiple', function(){
  // prob. not common, but *can* build multiple extensions at once
  gulp.src('./*/package.json')
    .pipe(xpi())
    .pipe(gulp.dest('./build/'));
});
```

Dependencies
============
Those listed by [node-cxf](https://github.com/jsantell/node-cfx#dependencies):
* python
* firefox

See [Mozilla's SDK installation page](https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/Installation) for more information
