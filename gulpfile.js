var gulp = require("gulp");
var browserify = require("browserify");
var source = require('vinyl-source-stream');
var uglify = require('gulp-uglify');
var buffer = require('gulp-buffer');
var transform = require('vinyl-transform');
var es = require('event-stream');
var fs = require('fs');
var path = require('path');

var buildFiles = [
    './build/src/modules/logger.js',
    './build/src/modules/adslot.js',
    './build/src/modules/loader.adslot.js',
    './build/src/modules/viewport.js',
    './build/src/interfaces/plugin.interface.js',
    './build/src/index.js'
];

var pluginsPath = './build/src/plugins/';

gulp.task('watch', function() {
    gulp.watch('./build/src/**/*.js', ['default']);
});

gulp.task("development", function() {
    return browserify({
            debug: true,
            entries: buildFiles,
        })
        .bundle()
        .pipe(source('molotov-ads.js'))
        .pipe(gulp.dest("build/dist"));
});

gulp.task("production", function() {
    return browserify({
            debug: false,
            entries: buildFiles,
        })
        .bundle()
        .pipe(source('molotov-ads.min.js'))
        .pipe(buffer())
        .pipe(uglify({
            compress: {
                drop_console: true,
                drop_debugger: true,
                global_defs: {
                    DEBUG: false
                }
            }
        }))
        .pipe(gulp.dest("build/dist"));
});

gulp.task("plugins-development", function() {
  var plugins = getFolders(pluginsPath);

  var tasks = plugins.map(function(folder) {
      var pluginFiles = getFiles(pluginsPath + folder);

      return browserify({
              debug: true,
              entries: pluginFiles,
          })
          .bundle()
          .pipe(source(folder + '.js'))
          .pipe(gulp.dest("build/dist/plugins"));
  });

  return es.concat.apply(null, tasks);
});

gulp.task("plugins-production", function() {
  var plugins = getFolders(pluginsPath);

  var tasks = plugins.map(function(folder) {
      var pluginFiles = getFiles(pluginsPath + folder);

      return browserify({
              debug: false,
              entries: pluginFiles,
          })
          .bundle()
          .pipe(source(folder + '.min.js'))
          .pipe(buffer())
          .pipe(uglify({
              compress: {
                  drop_console: true,
                  drop_debugger: true,
                  global_defs: {
                      DEBUG: false
                  }
              }
          }))
          .pipe(gulp.dest("build/dist/plugins"));
  });

  return es.concat.apply(null, tasks);
});

gulp.task("default", ["development", "production", "plugins-development", "plugins-production"]);

function getFolders(dir) {
    return fs.readdirSync(dir).filter(function(file) {
        return fs.statSync(path.join(dir, file)).isDirectory();
    });
}

function getFiles(dir, filelist) {
    files = fs.readdirSync(dir);
    filelist = filelist || [];

    files.forEach(function(file) {
        if (fs.statSync(path.join(dir, file)).isDirectory()) {
            filelist = getFiles(path.join(dir, file), filelist);
        } else {
            filelist.push(path.join(dir, file));
        }
    });
    return filelist;
}
