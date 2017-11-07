# create-web-site

# What it does
All base files used for creating a new site from start to finish. Including Saas, Pug(jade), js, browsersync, bourbon, font-awesome controlled by a gulpfile and bower. All is ready & configured

## How to use
Use these files when you want to create a web site. At the end you get all neccessary file to publish a build folder. You should create your web site using Pug(Jade), Sass(scss). It's a lot quicker to use these technologies. Check a look on their web site.

###YOU MUST BE COMFORTABLE USING GULP

Gulp does a lot of tasks by default:
    1. It compiles scss files to css
    2. It compiles pug files to html
    3. It performs a lint on pug, js and scss files
    4. It creates 1x, 2x and 3x images.
    5. It compresses svg
    6. It compresses images
    7. It concatenates and minifies css files
    8. It concatenates and uglifies js files (watch out for angular)
    9. It injects css and js files into html files
    10. It passes throught html to set critical css
    11. It minifies html files
    12. It creates sitemaps.xml (for google)
    13. It uploads "build files" on your ftp server

You have 2 other functions to
- test link (gulp testbuild)
- test source file with browser-sync (gulp browser-sync)

## Installation

  1. Install [node.js](https://nodejs.org/en/ "Node.js")
  2. Install [bower](https://bower.io "Bower")
  3. Clone the repository or download the zip in your new web site folder
  4. ``` npm install gulp -g```
  5. ``` npm install```
  6. ``` bower install```


# GULP function

``` gulp css```
Compiles your scss files into a css folder in scr folder.
Runs autoprefixer on css
Reloads browsersync if needed

``` gulp vet```
Passes jshint on your javascript files

``` gulp pug```
Compiles Pug files in the src folder

```gulp svg```
Compresses svg image

``` gulp retina```
Transforms any _2x.png, _2x.jpg or _2x.jpeg already into the images folder to 1x images keeping the 2x version into the same folder.
Creates also the 3x images if needed.( Bourbon installed with bower use by defalut _2x not @2x.

``` gulp image-optim```
Optimises images to lower the files size.

``` gulp compile```
Will run all previous tasks and it will uglyfy js, minify css, concatenate css and js and will inject them into the htmls. It will save the htmls in a build folder.

``` gulp critical```
Will put "above the fold" css inline into html (faster load page)

``` gulp minify_html```
will minify html file

``` gulp sitemap```
Creates a sitemap.xml in the build folder

```gulp clean-build```
deletes all files in build folder

``` gulp build```
Does all the previous task and run browser sync on the build folder

``` gulp testBuild```
Changes your site and will check the link online.

``` gulp watch```
Will run browser sync on src file and watych css, jad and js file.

``` gulp browser-sync```
Runs browser sync on your src folder

``` gulp upload```
Runs build folder and uploads ftp ( you need to edit the credentials)
