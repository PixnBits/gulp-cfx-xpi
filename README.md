gulp-cfx
========

Package Firefox Add-ons in the pipeline.

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
