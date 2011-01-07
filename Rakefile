require 'rubygems'
require 'rake'
require 'rake/packagetask'
require 'closure-compiler'

PACKAGE_VERSION = File.read('VERSION').strip
PACKAGE = "declarative.jquery"

JS_ROOT     = File.expand_path(File.dirname(__FILE__))
JS_SRC_DIR  = File.join(JS_ROOT, 'src')
JS_DIST_DIR = File.join(JS_ROOT, 'dist')
JS_PKG_DIR  = File.join(JS_ROOT, 'pkg')

JS_FILES = [
  File.join(JS_SRC_DIR, 'render.js'),
  File.join(JS_SRC_DIR, 'actions.js'),
  File.join(JS_SRC_DIR, 'render.mapping.js'),
  File.join(JS_SRC_DIR, 'actions.mapping.js')
]

task :default => [:clean, :concat, :dist]

desc "Clean the distribution directory."
task :clean do
  rm_rf JS_DIST_DIR
  mkdir JS_DIST_DIR
end

def normalize_whitespace(filename)
  contents = File.readlines(filename)
  contents.each { |line| line.sub!(/\s+$/, "") }
  File.open(filename, "w") do |file|
    file.write contents.join("\n").sub(/(\n+)?\Z/m, "\n")
  end
end

desc "Strip trailing whitespace and ensure each file ends with a newline"
task :whitespace do
  Dir["*", "src/**/*", "test/**/*", "examples/**/*"].each do |filename|
    normalize_whitespace(filename) if File.file?(filename)
  end
end

desc "Concatenate to build a distributable file"
task :concat => :whitespace do
  File.open(File.join(JS_DIST_DIR, "#{PACKAGE}.js"),"w") do |f|
    f.puts JS_FILES.map{ |s| IO.read(s) }
  end
end

def process_minified(src, target)
  cp target, File.join(JS_DIST_DIR,'temp.js')
  msize = File.size(File.join(JS_DIST_DIR,'temp.js'))
  `gzip -9 #{File.join(JS_DIST_DIR,'temp.js')}`

  osize = File.size(src)
  dsize = File.size(File.join(JS_DIST_DIR,'temp.js.gz'))
  rm_rf File.join(JS_DIST_DIR,'temp.js.gz')

  puts "Original version: %.3fk" % (osize/1024.0)
  puts "Minified: %.3fk" % (msize/1024.0)
  puts "Minified and gzipped: %.3fk, compression factor %.3f" % [dsize/1024.0, osize/dsize.to_f]
end

def google_compiler(src, target)
  puts "Minifying #{src} with Google Closure Compiler..."
  File.open(target, "w") do |f|
    f.puts Closure::Compiler.new.compile(File.read(src))
  end
end

desc "Generates a minified version for distribution."
task :dist do
  src, target = File.join(JS_DIST_DIR, "#{PACKAGE}.js"), File.join(JS_DIST_DIR, "#{PACKAGE}.min.js")
  google_compiler src, target
  process_minified src, target
end

Rake::PackageTask.new(PACKAGE, PACKAGE_VERSION) do |package|
  package.need_tar_gz = true
  package.need_zip = true
  package.package_dir = JS_PKG_DIR
  package.package_files.include(
    'README.md',
    'LICENSE',
    'dist/**/*',
    'src/**/*',
    'test/**/*'
  )
end
