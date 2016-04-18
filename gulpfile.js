var gulp        = require('gulp');
var browserSync = require('browser-sync');
var sass        = require('gulp-sass');
var prefix      = require('gulp-autoprefixer');
var minifycss   = require('gulp-minify-css');
var rename      = require('gulp-rename');
var cp          = require('child_process');
var deploy      = require('gulp-gh-pages');
var scsslint    = require('gulp-scss-lint');
var imagemin    = require('gulp-imagemin');


var messages = {
    jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

/**
 * Build the Jekyll Site
 */
gulp.task('jekyll-build', function (done) {
    browserSync.notify(messages.jekyllBuild);
    return cp.spawn('jekyll', ['build'], {stdio: 'inherit'})
        .on('close', done);
});

/**
 * Rebuild Jekyll & do page reload
 */
gulp.task('jekyll-rebuild', ['jekyll-build'], function () {
    browserSync.reload();
});

/**
 * Wait for jekyll-build, then launch the Server
 */
gulp.task('browser-sync', ['sass', 'jekyll-build'], function() {
    browserSync({
        server: {
            baseDir: '_site'
        }
    });
});

/**
 * Compile files from _scss into both css and _includes
 */
gulp.task('sass', function () {
    console.log('Running Sass');
    return gulp.src('_scss/main.scss')
        .pipe(sass())
        .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        .pipe(minifycss())
        .pipe(rename('main.min.css'))
        .pipe(gulp.dest('css'))
        .pipe(gulp.dest('_includes'))
        .pipe(browserSync.reload({stream:true}));
});

/**
 * Deploy to Gh-Pages
 */
gulp.task("deploy", ["jekyll-build"], function () {
    return gulp.src("./_site/**/*")
        .pipe(deploy());
});

/**
 * Minify Images
 */
gulp.task('imagemin', function () {
    return gulp.src('images/*')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest('_site/images'));
});

/**
 * Watch scss files for changes & recompile AND lint :)
 * Watch html/md files, run jekyll & reload BrowserSync
 * Minify images too
 */
gulp.task('watch', function () {
    gulp.watch('_scss/**/*.scss', ['sass', 'jekyll-build']);
    gulp.watch(['index.html', 'archive.html', '_layouts/*.html', '_includes/*.html', '_posts/**/*', 'archive/*', 'speaking/*', 'about/*'], ['jekyll-rebuild']);
    gulp.watch(['images/*'], ['imagemin'])
});

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site, launch BrowserSync & watch files.
 */
gulp.task('default', ['browser-sync', 'watch']);