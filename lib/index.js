const { dest, src, series, parallel, watch } = require('gulp')
const loadPlugins = require('gulp-load-plugins')
const plugins = loadPlugins()
const del = require('del')
const browserSync = require('browser-sync')
const bs = browserSync.create()
const cwd = process.cwd() // 返回当前命令行所在的工作目录
let config = {
  build:{
    src: 'src',
    dist: 'dist',
    public: 'public',
    temp: 'temp',
    paths: {
      styles: 'assets/styles',
      scripts: 'assets/scripts',
      pages: '*.html',
      images: 'assets/images/**',
      fonts: 'assets/fonts/**'
    }

  }
}
try {
  const loadConfig = require(`${cwd}/pages.config.js`)
  config = Object.assign({},config,loadConfig)
  console.log(config)
} catch (e) {}

const clean = () => {
  return del([config.build.dist, config.build.temp])
}
const style = ()=>{
  return src(config.build.paths.styles, { base: config.build.src, cwd: config.build.src })
        .pipe(plugins.sass({outputStyle: 'expanded'}))
        .pipe(dest(config.build.temp))
        .pipe(bs.reload({stream:true}))
}
const scripts = () => {
  return src(config.build.paths.scripts, { base: config.build.src, cwd: config.build.src })
        .pipe(plugins.babel({ presets:[require('@babel/preset-env')]}))
        .pipe(dest(config.build.temp))
        .pipe(bs.reload({stream:true}))
}
const page = () => {
  return src(config.build.paths.pages, { base: config.build.src, cwd: config.build.src })//两个*可以查到子目录下的html文件
        .pipe(plugins.swig({ data: config.data, defaults: { cache: false } }))
        .pipe(dest(config.build.temp))
        .pipe(bs.reload({stream:true}))
}
const image = () => {
  return src(config.build.paths.images, { base: config.build.src, cwd: config.build.src })
         .pipe(plugins.imagemin())
         .pipe(dest(config.build.dist))
}
const font = () => {
  return src(config.build.paths.fonts, { base: config.build.src, cwd: config.build.src })
         .pipe(plugins.imagemin())
         .pipe(dest(config.build.dist))
}
const extra = () => {
  return src('**',{ base: config.build.public, cwd: config.build.public })
       .pipe(dest('dist'))
}
const serve = () => {
  watch(config.build.paths.styles, { cwd: config.build.src }, style)
  watch(config.build.paths.scripts, { cwd: config.build.src }, scripts)
  watch(config.build.paths.pages, { cwd: config.build.src }, page)
  watch([
    config.build.paths.images,
    config.build.paths.fonts
  ], { cwd: config.build.src }, bs.reload)
  watch('**', { cwd: config.build.public }, bs.reload)
  bs.init({
    file:'dist/**',
    server: {
      baseDir: [config.build.temp, config.build.dist, config.build.public],
      routes: {
        '/node_modules': 'node_modules'
      }
    }
  })
}
const useref = () => {
  return src(config.build.paths.pages,{ base: config.build.temp, cwd: config.build.temp })
         .pipe(plugins.useref({ searchPath:[config.build.temp, '.'] }))
         .pipe(plugins.if(/\.js$/, plugins.uglify()))
         .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
         .pipe(plugins.if(/\.html$/, plugins.htmlmin({ 
               collapseWhitespace:true,
               minifyCSS: true,
               minifyJS: true
           })))
         .pipe(dest(config.build.dist))
}
const compile = parallel(style, scripts, page)
const build = series(
  clean, 
  parallel(
    series(compile,useref), 
    image, 
    font, 
    extra
  )
)
const develop = series(compile, serve)
module.exports = {
  clean,
  build,
  develop
}