var gulp = require('gulp');
var args = require('yargs').argv;
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

gulp.task('vet', function() {
	 return gulp
	 .src('./src/js//*.js')
	 .pipe($.if(args.verbose, $.print()))
	 .pipe($.jshint())
	 .pipe($.jshint.reporter('jshint-stylish', {verbose: true}))
	 .pipe($.jshint.reporter('fail'));
});

gulp.task('jade', function(){
	return gulp
	.src('./src/jade/*.jade')
	.pipe($.jade({
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


gulp.task('browser-sync',['css', 'vet', 'jade'] function(){
	browsersync.init({
		server: {
			baseDir : './src/'
			}
		});
});


gulp.task('cleanbuild', function(){
	return del('./build/**/*');
});

gulp.task('compiled',['css', 'vet', 'image-optim', 'jade'], function(){
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
	var opts = {spare:true}

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
	.pipe(gulp.dest('./build'))
});

gulp.task('watch', ['browser-sync'], function() {
	gulp.watch('./src/js/*.js', ['vet']);
	gulp.watch('./src/sass/**/*', ['css']);
	gulp.watch('./src/jade/*.jade', ['jade']).on('change', browsersync.reload);
});