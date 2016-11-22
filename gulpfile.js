var gulp = require('gulp');
var del = require('del');
var browsersync = require('browser-sync').create();
var critical = require('critical').stream;
var checkPages = require('check-pages');
var pngquant = require('imagemin-pngquant');
var ftp = require( 'vinyl-ftp' );
var gutil = require('gulp-util');
var replace = require('gulp-replace-path');
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
	.src('./src/pug/index.pug')
	.pipe($.pug({
		pretty:true
	}))
	.pipe(gulp.dest('./src'));
});

gulp.task('pugservice', function(){
	return gulp
	.src('./src/pug/services/**/*.pug')
	.pipe($.pug({
		pretty:true
	}))
	.pipe(gulp.dest('./src/services'));
});


gulp.task('lint', function(){
    return gulp
    .src('./src/js/**/*.js')
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))

})


gulp.task('svg', function(){
    return gulp.src('src/images/**/*.svg')
    .pipe($.svgmin())
    .pipe(gulp.dest('./build/images'));
});

gulp.task('retina',['svg'], function(){

    return gulp.src(['./src/images/**/*.{jpg,png}', '!.src/images/optim'])
        .pipe($.responsive({
          // Resize all JPG images to three different sizes: 100, 200, and 400, 800 pixels
          '**/*.jpg': [{
            width: 600,
            rename: { suffix: 'phone_2x' },
          }, {
            width: 960,
            rename: { suffix: 'phone-land_2x' },
          }, {
            width: 1536,
            rename: { suffix: 'tablet_2x' },
          }, {
            width: 1920,
            rename: { suffix: '' },
            },{
          width: 2880,
            rename: { suffix: '_2x' },
            },{
            // Compress, strip metadata, and rename original image
            rename: { suffix: '-original' },
          }],
          // Resize all PNG images to be retina ready
          '**/*.png': [{
            width: 72,
            }, {
            width: 144,
            rename: { suffix: '_2x' }
        }],
            }, {
          // Global configuration for all images
          // The output quality for JPEG, WebP and TIFF output formats
          quality: 80,
          // Use progressive (interlace) scan for JPEG and PNG output
          progressive: true,
          // Strip all metadata
          withMetadata: false,
          withoutEnlargement: true,
          // Do not emit the error when image is enlarged.
          errorOnEnlargement: false,
        }))
        .pipe(gulp.dest('./src/images/optim/'));
    });


gulp.task('image-optim', ['retina'], function(){
	 return gulp.src('./src/images/optim/**/*')
        .pipe($.imagemin({
            progressive: true,
            use: [pngquant()]
        }))
        .pipe(gulp.dest('./build/images/'));
});

gulp.task('optim',['image-optim'], function(){
    return del(['./build/images/optim/','./src/images/optim/']);
});

gulp.task('browser-sync',['compiled'], function(){
	browsersync.init({
		server: {
			baseDir : './build/'
			}
		});
});


gulp.task('compiled',['css', 'pug'], function(){
	return gulp.src('./src/**/*.html')
	.pipe ($.useref())
	.pipe($.if('*.js', $.uglify()))
	.pipe($.if('*.css', $.csso()))
	.pipe(gulp.dest('./build'));

});

gulp.task('critical',['compiled'], function(){
    gulp.task('critical', function () {
    return gulp.src('build/**/*.html')
        .pipe(critical({
            base: 'build/',
            inline: true,
            minify:true,
            ignore: ['@font-face','@import'],

            css: 'build/css/all.css'})
        )
        .pipe(gulp.dest('build'));
});
});


gulp.task('minify_HTML', ['critical'], function(){
	return gulp.src('./build/**/*.html')
    .pipe($.htmlmin({collapseWhitespace: true}))
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
	gulp.watch('./src/js/*.js').on('change', browsersync.reload);
	gulp.watch('./src/sass/**/*', ['css']);
	gulp.watch('./src/pug/*.pug', ['pug']).on('change', browsersync.reload);
});

gulp.task('upload', ['build'], function(){
    var conn = ftp.create( {
       host:     'ftp.host.com',
       user:     'username',
       password: 'password',
       parallel: 10,
       log:      gutil.log
   } );

   var globs = [
       './build/**/*',
      ];

      return gulp.src( globs, { buffer: false } )
        .pipe( conn.dest( '/' ) );

});
