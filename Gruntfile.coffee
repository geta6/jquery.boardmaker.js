'use strict'

module.exports = (grunt) ->

  require 'coffee-errors'

  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-coffee-lint'
  grunt.loadNpmTasks 'grunt-simple-mocha'
  grunt.loadNpmTasks 'grunt-notify'

  grunt.registerTask 'test',    [ 'coffee_lint', 'coffee', 'uglify' ]
  grunt.registerTask 'default', [ 'test', 'watch' ]

  grunt.initConfig

    coffee_lint:
      options:
        max_line_length:
          value: 79
        indentation:
          value: 2
        newlines_after_classes:
          level: 'error'
        no_empty_param_list:
          level: 'error'
        no_unnecessary_fat_arrows:
          level: 'ignore'
        globals: [
          'window', 'document', 'jQuery', 'console'
        ]
      dist:
        files: [
          { expand: yes, cwd: 'src/', src: [ '**/*.coffee' ] }
        ]

    coffee:
      dist:
        files: [
          'lib/jquery.boardmaker.js': [ 'src/jquery.boardmaker.coffee' ]
        ]

    uglify:
      dist:
        files: [
          'lib/jquery.boardmaker.min.js': [ 'lib/jquery.boardmaker.js' ]
        ]

    simplemocha:
      options:
        ui: 'bdd'
        reporter: 'spec'
        compilers: 'coffee:coffee-script'
        ignoreLeaks: no
      dist:
        src: [ 'tests/test.coffee' ]

    watch:
      options:
        interrupt: yes
      dist:
        files: [ 'src/**/*.coffee', 'tests/**/*.coffee' ]
        tasks: [ 'test' ]
