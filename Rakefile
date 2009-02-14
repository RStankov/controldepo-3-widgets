require 'erb'
require 'rake'

CD3W_SRC  = 'src/**/*.js'
CD3W_DIST = 'dist/cd3w.js'

desc 'Create a package for ControlDepo 3 Widgets ( accepts componets and save_to arguments )'
task :dist do
  begin
    require "sprockets"
  rescue LoadError => e
    puts "\nYou'll need Sprockets to pack ControlDepo 3 Widgets install it by:\n\n"
    puts "  $ gem install --remote sprockets\n\n"
    return
  end
  
  sources = if ENV['components'].nil?
    [CD3W_SRC]
  else
    ENV['components'].split(' ').inject [] do |memo, component|
      path =  'src/' + component
      path << '.js' unless component.end_with? '.js'
      memo << path
    end
  end
  
  sources.unshift 'src/header.js'
  destination = ENV['save_to'].nil? ? CD3W_DIST : ENV['save_to']
  
  secretary = Sprockets::Secretary.new(
    :load_path    => ["vendor/*.js", CD3W_SRC],
    :source_files => sources
  )
  
  secretary.concatenation.save_to(destination)
end

TESTS = 'tests/unit/';
TTEMPLATES = 'tests/templates/';

namespace :test do
  desc 'Create new unit test'
  task :create do
    test = ENV['name']
    title = ENV.include?('title') ? ENV['title'] : test
    File.open(TESTS + test + '.html', 'w+') do |file|
      template = ERB.new(IO.read(TTEMPLATES + 'test_case.erb'))
      file.puts template.result(binding)
    end
    puts 'template created'
    
    Rake.application['test:update'].invoke
  end
  
  task :update do
    testcases = FileList[TESTS + '*.html'].map { |n| File.basename(n, '.html') };
    
    File.open('tests/tests.html', 'w+') do |file|
      template = ERB.new(IO.read(TTEMPLATES + 'tests.erb'))
      file.puts template.result(binding)
    end
    
    puts 'tests menu updated'
  end
end
