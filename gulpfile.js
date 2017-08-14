var gulp = require('gulp');
var del = require('del');
var browsersync = require('browser-sync').create();
var critical = require('critical').stream;
var checkPages = require('check-pages');
var pngquant = require('imagemin-pngquant');
var imageminJpegRecompress = require('imagemin-jpeg-recompress');
var ftp = require( 'vinyl-ftp' );
var gutil = require('gulp-util');
var buffer = require('vinyl-buffer');
var spritesmith = require('gulp.spritesmith');
var sassLint = require('gulp-sass-lint');
var pugLint = require('gulp-pug-linter');
var revReplace = require('gulp-rev-replace');
var $ = require('gulp-load-plugins')({lazy: true});

// clean build folder for cache-bust
gulp.task('clean', function(){
    return del(['./build/css/','./build/js/']);
});


//lint task

function isFixed(file) {

    return file.eslint != null && file.eslint.fixed;
}



gulp.task('jslint',['clean'], function(){
    return gulp
        .src(['./src/js/**/*.js', '!./src/js/googleanalytics.js','!./src/js/svg4everybody.js','!./src/js/mouseflow.js', '!./src/js/tawk.js','!./src/js/animation.js','!./src/js/cookie.js','!./src/js/scripts.js'])
        .pipe($.eslint({fix:true}))
        .pipe($.eslint.format())
        .pipe($.if(isFixed, gulp.dest('./src/js/fixtures')))

        .pipe($.eslint.failAfterError())
});

gulp.task("sasslint", function(){
    return gulp
        .src(['./src/sass/**/*.scss','!./src/sass/_spritepng.scss'])
        .pipe(sassLint( {options:{

            configFile: './sass-lint.yml',
        }}))
        .pipe(sassLint.format())
        .pipe(sassLint.failOnError())
});

gulp.task('puglint', function () {
  return gulp
    .src('./src/pug/**/*.pug')
    .pipe(pugLint())
    .pipe(pugLint.reporter('fail'))
});


//compile css - pug

gulp.task('css', ['sasslint'], function(){
return gulp
		.src('./src/sass/styles.scss')
		.pipe($.sass())
		.pipe($.autoprefixer({
            browsers: ['ie >= 11', 'last 2 versions', 'last 2 versions'],
            cascade: false
        }))
		.pipe(gulp.dest('./src/css/'))
        .pipe(browsersync.reload({stream:true}));

});


gulp.task('pug',['pugfr'], function(){
	return gulp
	.src('./src/pug/*.pug')
	.pipe($.pug({
		pretty:true
	}))
	.pipe(gulp.dest('./src'));
});

gulp.task('pugfr', ['pugen'], function(){
	return gulp
	.src('./src/pug/fr/**/*.pug')
	.pipe($.pug({
		pretty:true
	}))
	.pipe(gulp.dest('./src/fr'));
});

gulp.task('pugen', ['puglint'], function(){
	return gulp
	.src('./src/pug/en/**/*.pug')
	.pipe($.pug({
		pretty:true
	}))
	.pipe(gulp.dest('./src/en'));
});


// js script concatenatetion on html files

gulp.task('svg4everybody',['jslint'], function(){
    return gulp.src('./src/js/svg4everybody.js')
    .pipe(gulp.dest('./build/js/'))
})

gulp.task('compiled',['css', 'pug', 'svg4everybody'], function(){
    var jsFilter = $.filter("**/*.js", { restore: true });
    var cssFilter = $.filter("**/*.css", { restore: true });
    var indexHtmlFilter = $.filter(['**/*', '!**/*.html'], { restore: true });


	return gulp.src('./src/**/*.html')
    .pipe($.useref())      // Concatenate with gulp-useref
    .pipe(jsFilter)
    .pipe($.uglify())
    .pipe(jsFilter.restore)
    .pipe(cssFilter)
    .pipe($.csso())               // Minify any CSS sources
    .pipe(cssFilter.restore)
    .pipe(indexHtmlFilter)
    .pipe($.rev())                // Rename the concatenated files (but not index.html)
    .pipe(indexHtmlFilter.restore)
    .pipe(revReplace())         // Substitute in new filenames
	.pipe(gulp.dest('./build/'));
});



// google css on top

gulp.task('critical',['compiled'], function(){
    gulp.task('critical', function () {
    return gulp.src('build/**/*.html')
        .pipe(critical({
            base: 'build/',
            inline: true,
            minify:true,
            ignore: ['@font-face','@import'],
            timeout: 60000,

            css: './src/css/styles.css'})
        )
        .on('error', function(err) { gutil.log(gutil.colors.red(err.message)); })
        .pipe(gulp.dest('build'));
});
});


//minify html

gulp.task('minify_HTML', ['critical', 'php'], function(){
	return gulp.src('./build/**/*.html')
    .pipe($.htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('./build'));
});

gulp.task('minify_HTMLseul', function(){
	return gulp.src('./build/**/*.html')
    .pipe($.htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('./build'));
});




gulp.task('testBuild', function(done){
	var options = {
		pageUrls: [
			'https://www.example.com'
		],
		checkLinks: true,
		//linksToIgnore:['yousite path to ignore with http'],
		summary: true,
		maxResponseTime : 1000
	};
	checkPages(console, options, done);
});


gulp.task('sitemap',['minify_HTML'], function(){
	return gulp
	.src(['./build/**/*.html'])
	.pipe($.sitemap({
		siteUrl: 'https://www.example.com',
		changefreq: 'weekly',

	}))
	.pipe(gulp.dest('./build'));
});

//upload every thing

gulp.task('upload', ['minify_HTML'], function(){
    var conn = ftp.create( {
       host:     'ftp.example.com',
       user:     'username',
       password: 'password',
       parallel: 5,
       log:      gutil.log
   } );

   var globs = [
       './build/**/*',
      ];

      return gulp.src( globs, { buffer: false } )
        .pipe( conn.dest( '/' ) );

});

gulp.task('uploadseul', ['minify_HTMLseul'], function(){
    var conn = ftp.create( {
       host:     'ftp.example.com',
       user:     'username',
       password: 'password',
       parallel: 5,
       log:      gutil.log
   } );

   var globs = [
       './build/**/*',
      ];

      return gulp.src( globs, { buffer: false } )
        .pipe( conn.dest( '/' ) );

});

//image task

gulp.task('svgoptim', function(){
    return gulp.src('./src/images/**/*.svg')
    .pipe($.svgmin())
    .pipe($.svgstore())
    .pipe(gulp.dest('./build/images/'));
});


gulp.task('retina',['svg'], function(){

    return gulp.src(['./src/images/**/*.{jpg,png}', '!./src/images/optim', '!./src/images/client/**/*.png'])
        .pipe($.responsive({
          // Resize all JPG images to three different sizes: 100, 200, and 400, 800 pixels
          '**/*.jpg': [{
            width: 600,
            rename: { suffix: 'phone_2x' },
            quality: 100
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
            rename: { suffix:'_thumb'}
            }, {
            width: 144,
            rename: { suffix: '_thumb_2x' }
        },
        {
            width: 580,
        },{
            width: 1160,
            rename:{ suffix:'_2x'}

            }],
            }, {

          withMetadata: false,
          progressive: false,
          withoutEnlargement: true,
          quality: 100,
          toColourspace: 'rgb',
          ChromaSubsampling:'4:2:2',
          errorOnEnlargement: false,
        }))
        .pipe(gulp.dest('./src/images/optim/'));
    });


gulp.task('png', ['retina'], function(){
	 return gulp.src('./src/images/optim/**/*.png')
        .pipe($.imagemin({
            progressive: true,
            verbose: true,
            quality:68,
            use: [pngquant()]
        }))
        .pipe(gulp.dest('./build/images/'));
});

gulp.task('pngforsprite',['png'], function(){
    return gulp.src('./src/images/**/*.png')
    .pipe($.responsive({'**/*.png': [{
        width: 72
        }, {
          width: 144,
        rename: { suffix: '@2x' }
        }],
        }, {

         withMetadata: false,
        progressive: false,
        withoutEnlargement: true,
        quality: 100,
        toColourspace: 'rgb',
        ChromaSubsampling:'4:2:2',
        errorOnEnlargement: false,
    }))
    .pipe(gulp.dest('./src/images/optim/'))

})

gulp.task('sprite',['pngforsprite'], function(){

  // Generate our spritesheet
  var spriteData = gulp.src('./src/images/optim/*.png')
  .pipe(spritesmith({
    retinaSrcFilter: './src/images/optim/*@2x.png',
    imgName: 'sprite.png',
    retinaImgName: 'sprites@2x.png',
    imgPath: '../images/sprite.png',
    retinaImgPath: '../images/sprites@2x.png',

    cssName: '_spritepng.scss',

  }));


  spriteData.img.pipe(buffer())
    .pipe($.imagemin({
        progressive: true,
        verbose: true,
        quality:68,
        use: [pngquant()]
    }))
    .pipe(gulp.dest('./build/images/'));
    spriteData.css.pipe(gulp.dest('./src/sass/'));

});

gulp.task('image-optim', ['sprite'], function(){
	 return gulp.src('./src/images/optim/**/*.jpg')
        .pipe($.imagemin([
            imageminJpegRecompress({
                verbose: true,
                progressive: true,
                max: 80,
                min: 70
            })
        ]))
        .pipe(gulp.dest('./build/images/'));
});

gulp.task('optim',['image-optim'], function(){
    return del(['./build/images/optim/','./src/images/optim/']);
});
