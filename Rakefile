require 'erb'
require 'rake'

desc 'Create a package for ControlDepo 3 Widgets ( accepts save_to argument )'
task :dist do
  begin
    require "sprockets"
  rescue LoadError => e
    puts "\nYou'll need Sprockets to pack ControlDepo 3 Widgets install it by:\n\n"
    puts "  $ gem install --remote sprockets\n\n"
    return
  end

  sources = ['vendor/prototype.js', 'vendor/effects.js', 'vendor/dragdrop.js', 'src/controldepo.js']
  
  secretary = Sprockets::Secretary.new( :source_files => sources )
  secretary.concatenation.save_to( ENV['save_to'].nil? ? 'dist/cd3widgets.js': ENV['save_to'] )
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
