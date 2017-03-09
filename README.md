# create-web-site
All base files used for creating a new site from start to finish. Including Saas, jade, js, browsersync, bourbon, font-awesome controlled by a gulp file. All ready configured

# What it does
Use these file when you wan to create a web site. At the end you get all neccessary file to publish in a build folder. You should create your web site using Jade, Sass(scss). It's a lot quicker to use these technologies. Check a look on there web site.

YOU MOST BE CONFORTABLE USING GULP

Gulp does a lot a tasks by default:
	1. It compiles scss files to css
    2. It compiles jade files to html
    3. It checks errors and formating if javascript
    4. It creates 1x images
    5. it Compress images
    6. It concatenates and minifies css files
    7. It concatenates and uglifies js files (watch out for angular)
    8. It injects css and js files into html files
    9. It passes throught html to set critical css
   10. It minify html files
   11. It creates sitemaps.xml (for google)

You have 3 other functions to
- clean build folder (gulp cleanbuild)
- test link (gulp testbuild)
- test source file with browser-sync (gulp browser-sync)

# Installation

  1. Install [node.js](https://nodejs.org/en/ "Node.js")
  2. Install [bower](https://bower.io "Bower")
  3. Clone the repository or download the zip in your new web site folder
  4. ``` npm install gulp -g```
  5. ``` npm install```
  6. ``` bower install```


# GULP function

``` gulp css```
Compiles you scss files into a css folde in scr folder.
Runs autoprefixer on it
Reload browsersync if needed

``` gulp vet```
Passes jshint on your javascript files

``` gulp pug```
Compiles pug files in the src folder

``` gulp retina```
Transforms any _2x.png, _2x.jpg or _2x.jpeg already into the images folder to 1x images keeping the 2x version into the same folder. ( Bourbon installed with bower use by defalut _2x not @2x.

``` gulp image-optim```
Optimises images for a lower file size.


``` gulp compile```
Will run all previous task and it will uglyfy js, minify css, concatenate css and js qand will inject them into the htmls. It will save the htmls in a build folder.

``` gulp critical```
Will put above the fold css inline into html (faster load page)

``` gulp minify_html```
will minify html file

``` gulp sitemap```
Create a sitemap.xml in the build folder

``` gulp build```
Create all the previous task and run browser sync on the build folder

``` gulp testBuild```
Change your site and will check the link online.

``` gulp watch```
Will run browser sync on src file and watych css, jad and js file.

``` gulp browser-sync```
Runs browser sync on your src folder

``` gulp clean-build```
Deletes all files into the build folder.
