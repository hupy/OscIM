import gulp from 'gulp'
import fs from 'fs'
import path from 'path'
import {merge} from 'event-stream'
import map from 'map-stream'
import {spawn} from 'child_process'
const uglify = require('gulp-uglify')
const minify = require('gulp-minify-css')
const $ = require('gulp-load-plugins')()
const config = require('./package.json')
const version = config.version
const name = config.name
const description = config.description
const homepage = config.homepage


// Tasks
gulp.task('clean', () => {
  return pipe('./tmp', $.clean())
})

gulp.task('build', (cb) => {
  $.runSequence('clean','styles', 'layim', 'chrome', cb)
})

gulp.task('styles', () => {
    return pipe(
        './src/styles/common.less',
        $.plumber(),
        $.less({relativeUrls: true}),
        $.autoprefixer({cascade: true}),
        './tmp'
    )
})

//layim
gulp.task('layim', ['layimjs','layimcss'], () => {

})

gulp.task('layimjs', () => {
    const mods = 'laytpl,laypage,laydate,jquery,layer,element,upload,form,tree,util,flow,layedit,code,layim'
    const src = [
        './src/layim/**/{layui,all,'+ mods +'}.js'
    ]
    return pipe(
        src,
        $.babel(),
        uglify(),
        $.concat('layui.all.js'),
        $.preprocess({context: {CHROME: true}}),
        './tmp'
    )
})

gulp.task('layimcss', () => {
    const css_dir = 'laydate,layer,layim'
    const src = [
        './src/layim/css/**/{layui,code,'+ css_dir +'}.css'
    ]
    return pipe(
        src,
        minify({compatibility: 'ie8'}),
        $.concat('layui.all.css'),
        $.preprocess({context: {CHROME: true}}),
        './tmp'
    )
})

// Chrome
gulp.task('chrome:js', () => {
    return buildJs(['./src/config/chrome/overrides.js'], {CHROME: true})
})

gulp.task('chrome',['styles','chrome:js'], () => {
    return merge(
        pipe('./icons/**/*', './tmp/chrome/icons'),
        pipe(['./tmp/*.css'], './tmp/chrome/css'),
        pipe('./src/layim/font/**/*', './tmp/chrome/font'),
        pipe(['./src/layim/images/**/*','./src/layim/css/modules/layim/**/*','./src/layim/css/modules/layer/**/*.{png,gif}'], './tmp/chrome/images'),
        pipe(['./tmp/*.js','./libs/*.js'], './tmp/chrome/js'),
        pipe('./src/config/chrome/background.js', $.babel(), './tmp/chrome/'),
        pipe('./src/config/chrome/manifest.json',
            $.replace('$VERSION', version),
            $.replace('$NAME', name),
            $.replace('$DESCRIPTION', description),
            $.replace('$HOMEPAGE', homepage),
            './tmp/chrome/'),
    )
})

gulp.task('chrome:zip', () => {
    return pipe('./tmp/chrome/**/*', $.zip('chrome.zip'), './dist')
})

gulp.task('chrome:_crx', (cb) => {
    $.run('"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"' +
        ' --pack-extension=' + path.join(__dirname, './tmp/chrome') +
        ' --pack-extension-key=' + path.join(process.env.HOME, '.ssh/chrome.pem')
    ).exec(cb)
})

gulp.task('chrome:crx', ['chrome:_crx'], () => {
    return pipe('./tmp/chrome.crx', './dist')
})

// Helpers
function pipe(src, ...transforms) {
  return transforms.reduce((stream, transform) => {
    const isDest = typeof transform === 'string'
    return stream.pipe(isDest ? gulp.dest(transform) : transform)
  }, gulp.src(src))
}

function html2js(template) {
  return map(escape)

  function escape(file, cb) {
    const path = $.util.replaceExtension(file.path, '.js')
    const content = file.contents.toString()
    const escaped = content
      .replace(/\\/g, "\\\\")
      .replace(/'/g, "\\'")
      .replace(/\r?\n/g, "\\n' +\n    '")
    const body = template.replace('$$', escaped)

    file.path = path
    file.contents = new Buffer(body)
    cb(null, file)
  }
}

function buildJs(overrides, ctx) {
  const src = [
    './src/api.js',
    './src/common.js',
    './src/util.storage.js',
  ].concat(overrides)

  return pipe(
    src,
    $.babel(),
    $.concat('common.js'),
    $.preprocess({context: ctx}),
    './tmp'
  )
}
