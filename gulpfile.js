"use strict";

var gulp = require('gulp');
<<<<<<< HEAD
var browserify = require('browserify'); 
var uglify = require('gulp-uglify');
var source = require('vinyl-source-stream'); 
var lint = require('gulp-eslint'); 
var sass = require('gulp-sass'); 
=======
var browserify = require('browserify'); // Bundles JS
//var transform = require('vinyl-transform');
//var uglify = require('gulp-uglify');
var source = require('vinyl-source-stream'); // Use conventional text streams with Gulp
//var concat = require('gulp-concat'); //Concatenates files
var lint = require('gulp-eslint'); //Lint JS files, including JSX
var sass = require('gulp-sass'); //sass
>>>>>>> 92b7a3277c105481a8646689e2f5a57c2b4eb69c
var browserSync = require('browser-sync').create();
var modernizr = require('gulp-modernizr');
var touch = require("touch");
var minify = require("gulp-minify");
var cleanCSS = require('gulp-clean-css');

var config = {
	paths: {
	    html: './src/html/*.html',
	    js: './src/js/*.js',
            mainJs: './src/js/app.js',
	    images: './src/images/*.*',
	    dist: './resources/public',
            sass: './src/sass/*.scss'
	}
};

gulp.task('modernizr', function() {
  gulp.src('./js/*.js')
    .pipe(modernizr())
    .pipe(gulp.dest("build/"))
});

gulp.task('serve', function () {
    browserSync.init({
        proxy: 'localhost:3000'
    });
    gulp.watch('./resources/public/css/*.css').on('change', browserSync.reload);
    gulp.watch('./resources/public/js/*.js').on('change', browserSync.reload);
    gulp.watch('./src/clj/*.clj').on('change', browserSync.reload);
});

gulp.task('html', function() {
    touch('./src/clj/handler.clj');
    gulp.watch('./src/html/*.html').on('change', browserSync.reload);
});

gulp.task('js', function() {
    browserify(config.paths.mainJs)
	.bundle()
	.on('error', console.error.bind(console))
	.pipe(source('app.js'))
	.pipe(gulp.dest(config.paths.dist + '/js'));
         console.log("js done");
});
 
gulp.task('js-minify', function() {
    gulp.src(config.paths.dist + '/js/*')
        .pipe(minify({
            ignoreFiles: ['*-min.js']
        }))
        .pipe(gulp.dest(config.paths.dist + '/js'));
    console.log('js minified');
});
 
gulp.task('sass', function() {
    gulp.src(config.paths.sass)
        .pipe(sass({
            includePaths: ['node_modules/foundation-sites/assets/',
                           'node_modules/foundation-sites/scss/settings/',
                          'node_modules/foundation-sites/scss/']}))
        .pipe(gulp.dest(config.paths.dist + '/css'));
});

gulp.task('css-minify', function() {
  return gulp.src(config.paths.dist + '/css/*.css')
        .pipe(cleanCSS({compatibility: 'ie8',
                        debug: true}, function(details){
                            console.log(details.name + ': ' + details.stats.originalSize);
                            console.log(details.name + ': ' + details.stats.minifiedSize);
                        }))
        .pipe(gulp.dest(config.paths.dist + '/css/min'));
});

gulp.task('images', function () {
    gulp.src(config.paths.images)
        .pipe(gulp.dest(config.paths.dist + '/images'));

    //publish favicon
    gulp.src('./src/favicon.ico')
        .pipe(gulp.dest(config.paths.dist));
});

gulp.task('lint', function() {
	return gulp.src(config.paths.js)
		.pipe(lint({config: 'eslint.config.json'}))
		.pipe(lint.format());
});

gulp.task('watch', function() {
    gulp.watch(config.paths.html, ['html']);
    gulp.watch(config.paths.js, ['js', 'lint', 'js-minify']);
    gulp.watch(config.paths.sass, ['sass', 'css-minify']);
});

gulp.task('default', ['html', 'js', 'sass', 'images', 'lint', 'js-minify', 'css-minify', 'watch', 'serve']);
