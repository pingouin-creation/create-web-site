var gulp = require('gulp');
var del = require('del');
var browsersync = require('browser-sync').create();
var critical = require('critical').stream;
var checkPages = require('check-pages');
var pngquant = require('imagemin-pngquant');
var ftp = require( 'vinyl-ftp' );
var gutil = require('gulp-util');
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

gulp.task('svg', function(){
    return gulp.src('src/images/**/*.svg')
    .pipe($.svgmin())
    .pipe(gulp.dest('./build/images'));
});

gulp.task('retina', function(){

    return gulp.src('./src/images/*.{jpg,png}')
        .pipe($.responsive({
          // Resize all JPG images to three different sizes: 100, 200, and 400, 800 pixels
          '*.jpg': [{
            width: 100,
            rename: { suffix: '' },
          }, {
            width: 200,
            rename: { suffix: '_2x' },
          }, {
            width: 400,
            rename: { suffix: '_3x' },
          }, {
            width: 800,
            rename: { suffix: '_4x' },
            },{
          width: 1600,
            rename: { suffix: '_full' },
            },{
            // Compress, strip metadata, and rename original image
            rename: { suffix: '-original' },
          }],
          // Resize all PNG images to be retina ready
          '*.png': [{
            width: 100,
            }, {
            width: 200,
            rename: { suffix: '_2x' },
            }, {
            width: 400,
            rename: { suffix: '_3x' },
            }, {
            width: 800,
            rename: { suffix: '_4x' },
            }, {
            width: 1600,
            rename: { suffix: '_full' },
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


gulp.task('cleanbuild', function(done){
	return del('./build/**/*');
    done();
});

gulp.task('compiled',['cleanbuild','css', 'image-optim', 'pug'], function(){
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
		height: 1000
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
