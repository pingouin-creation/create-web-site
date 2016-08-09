var gulp = require('gulp');
var del = require('del');
var browsersync = require('browser-sync').create();
var critical = require('critical').stream;
var checkPages = require('check-pages');
var pngquant = require('imagemin-pngquant');
var $ = require('gulp-load-plugins')({lazy: true, rename :{'gulp-minify-html-2': 'minifyHTML'}});

gulp.task('css', function(){
return gulp
		.src('./src/sass/styles.scss')
		.pipe($.sass())
		.pipe($.plumber())
		.pipe($.autoprefixer({
            browsers: ['last 2 version', '> 5%'],
            cascade: false
        }))
		.pipe(gulp.dest('./src/css/'))
        .pipe(browsersync.reload({stream:true}));

});

gulp.task('pug', function(){
	return gulp
	.src('./src/pug/*.pug')
	.pipe($.pug({
		pretty:true
	}))
	.pipe(gulp.dest('./src/'));
});

gulp.task('retina', function(){

var retinizeOpts = {
  flags: {1: '_1x', 2: '_2x'},
  flagsOut: {1: ''},
};
	  return gulp
	.src('./src/images/**/*.{png,jpg,jpeg}')
    .pipe($.retinize(retinizeOpts))
    .pipe(gulp.dest('./src/images/'));

});


gulp.task('image-optim', ['retina'], function(){
	 return gulp.src('./src/images/**/*')
        .pipe($.imagemin({
            progressive: true,
            use: [pngquant()]
        }))
        .pipe(gulp.dest('./build/images/'));
});


gulp.task('browser-sync',['css', 'pug'], function(){
	browsersync.init({
		server: {
			baseDir : './src/'
			}
		});
});


gulp.task('cleanbuild', function(){
	return del('./build/**/*');
});

gulp.task('compiled',['css', 'image-optim', 'pug'], function(){
	return gulp.src('./src/**/*.html')
	.pipe ($.useref())
	.pipe($.if('*.js', $.uglify()))
	.pipe($.if('*.css', $.csso()))
	.pipe(gulp.dest('./build/'));

});

gulp.task('critical',['compiled'], function(){
	return gulp
	.src('./build/*.html')
	.pipe(critical({
		base: './',
		inline: true,
		minify: true,
		width: 1000,
		height: 900
		 }))
	.pipe(gulp.dest('./build/'));
});


gulp.task('minify_HTML', ['critical'], function(){
	var opts = {spare:true};

	return gulp.src('./build/**/*.html')
    .pipe($.minifyHTML(opts))
    .pipe(gulp.dest('./build'));
});

gulp.task('build',['sitemap'] , function(){
	browsersync.init({
		server:'./build/'
	});
});

gulp.task('testBuild', function(done){
	var options = {
		pageUrls: [
			'your site with http'
		],
		checkLinks: true,
		linksToIgnore:['yousite path to ignore with http'],
		summary: true,
		maxResponseTime : 1000
	};
	checkPages(console, options, done);
});


gulp.task('sitemap',['minify_HTML'], function(){
	return gulp
	.src(['./build/**/*.html'])
	.pipe($.sitemap({
		siteUrl: '[yoursite]',
		changefreq: 'weekly',

	}))
	.pipe(gulp.dest('./build'));
});

gulp.task('watch', ['browser-sync'], function() {
	gulp.watch('./src/js/*.js', ['vet']);
	gulp.watch('./src/sass/**/*', ['css']);
	gulp.watch('./src/pug/*.pug', ['pug']).on('change', browsersync.reload);
});
