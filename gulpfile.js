// Required plugins 
var gulp      = require('gulp'),
    plugins   = require('gulp-load-plugins')()
    fs        = require('fs'),
    pkg       = JSON.parse(fs.readFileSync('./package.json')),
    opn       = require('opn'),
    p         = require('postcss-load-plugins')();

var server = {
  host: 'localhost',
  port: '8080'
};

// CSS config variables 
// Will be written to `:root` variables declaration 
var cssVars = {
    'root-font-size': '100%',
    'font-size': '16px'
};

var pxtoremOptions = {
  root_value: 16,
  prop_white_list: [
    'font',
    'font-size',
    'line-height',
    'letter-spacing',
    'margin',
    'margin-top',
    'margin-right',
    'margin-bottom',
    'margin-left',
    'padding',
    'padding-top',
    'padding-right',
    'padding-bottom',
    'padding-left',
    'top',
    'right',
    'bottom',
    'left',
    'border',
    'border-width'
  ],
  media_query: true
};

// Application filenames
var appFiles = {
    css: 'block.css',
    cssSG: 'styleguide.css',
};   

// Paths to source and dest directories
var basePaths = {
    src: 'src/',
    dest: 'dist/'
};

// Paths to assets
var assetPaths = {
    css: 'css/',
    app: 'app/',
    styleguide: 'styleguide/'
};

var styleguideOptions = {
  outputFile: basePaths.dest + assetPaths.app
};


var processors = {
  // Modern Browser Setup IE 9+
  modern: [
    p.cssnext({
        features: {
          customProperties: {
            variables: cssVars
          },
          compress: false,
          autoprefixer: { 
            browsers: ['last 2 version', '> 5%'] 
          },
          rem: false,
          colorRgba: false,
          filter: {
            oldIE: false
          }
        }
    }),
    p.mixins,
    p.nested,
    p.verticalRhythm,
    p.fakeid()   
  ],
  // Legacy Browser Setup < IE9
  legacy: []
};


gulp.task ('css', ['minify:css'], function (){
    
    return gulp.src(basePaths.src + assetPaths.css + appFiles.css)
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.postcss(processors.modern))
        .pipe(plugins.pxtorem(pxtoremOptions))
        .pipe(plugins.sourcemaps.write('.'))
        .pipe(gulp.dest(basePaths.dest + assetPaths.css));
});

gulp.task ('css:styleguide', ['minify:sgcss'], function (){
    return gulp.src(basePaths.src + assetPaths.styleguide + appFiles.cssSG)
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.postcss(processors.modern))
        .pipe(plugins.pxtorem(pxtoremOptions))
        .pipe(plugins.sourcemaps.write('.'))
        .pipe(gulp.dest(basePaths.dest + assetPaths.app));
});


gulp.task ('minify:css', ['stats:css'], function () {
    return gulp.src(basePaths.dest + assetPaths.css + appFiles.css)
        .pipe(plugins.cssmin({
          showLog: true
        }))
        .pipe(plugins.rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(basePaths.dest + assetPaths.css));
});

gulp.task ('minify:sgcss', function () {
    return gulp.src(basePaths.dest + assetPaths.app + appFiles.cssSG)
        .pipe(plugins.cssmin({
          showLog: true
        }))
        .pipe(plugins.rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(basePaths.dest + assetPaths.app));
});

gulp.task ('stats:css', function () {
  return gulp.src(basePaths.dest + assetPaths.css + appFiles.css)
    .pipe(plugins.cssstats())
    .pipe(gulp.dest(basePaths.dest + assetPaths.css));
});

gulp.task('webserver', function() {
  gulp.src(basePaths.dest + assetPaths.app)
    .pipe(plugins.webserver({
      host:             server.host,
      port:             server.port,
      livereload:       true,
      directoryListing: false
    }));
});



gulp.task('styleguide', plugins.shell.task([
  'kss-node <%= source %> <%= destination %> --css <%= css %> --template <%= template %>'
  ],{
    templateData: {
      source:       basePaths.src + assetPaths.css,
      mask:         '^(?!(styleguide)\.(css)$).*\.(css)$',
      destination:  basePaths.dest + assetPaths.app,
      css:          'styleguide.min.css',
      js:           '',
      template:     basePaths.src + assetPaths.styleguide,
      title:        'Bloc]{CSS - Simple Mobile-First CSS Framework'
    }
  }
));

gulp.task ('watch', function (){
  gulp.watch(basePaths.src + assetPaths.css + '**/*.css', ['css', 'css:styleguide', 'styleguide']);
  gulp.watch(basePaths.src + assetPaths.styleguide + '**/*.css', ['css:styleguide', 'styleguide']);
  gulp.watch(basePaths.src + assetPaths.styleguide + '*.html', ['css:styleguide', 'styleguide']);
});

gulp.task ('default', ['css','css:styleguide', 'styleguide', 'webserver', 'watch']);