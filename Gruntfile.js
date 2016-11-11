'use strict';

var gulp = require('gulp');
var hypher = require('gulp-hypher');
var hypher_de = require('hyphenation.de');
var xml2iCal = require('./xml2iCal');

module.exports = function(grunt) {

  grunt.initConfig({
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        'Gruntfile.js',
        'assets/js/*.js',
        'assets/js/plugins/*.js',
        '!assets/js/scripts.min.js'
      ]
    },
    uglify: {
      dist: {
        files: {
          'assets/js/scripts.min.js': [
            'assets/js/plugins/*.js',
            'assets/js/_*.js'
          ]
        }
      }
    },
    imagemin: {
      dist: {
        options: {
          optimizationLevel: 7,
          progressive: true
        },
        files: [{
          expand: true,
          cwd: 'images/',
          src: '{,*/}*.{png,jpg,jpeg}',
          dest: 'images/'
        }]
      }
    },
    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: 'images/',
          src: '{,*/}*.svg',
          dest: 'images/'
        }]
      }
    },
    gulp: {
      hypher: function() {
        return gulp.src(['_site/*/*.html', '_site/*.html'])
		  .pipe(hypher(hypher_de))
		  .pipe(gulp.dest('_site'));
      },
    },
    watch: {
      js: {
        files: [
          '<%= jshint.all %>'
        ],
        tasks: ['uglify']
      },
      html: {
        files: [
          '_site/*.html'
        ],
        tasks: ['gulp']
      },
      events: {
        files: [
          'termine.xml'
        ],
        tasks: ['xml-to-ical']
      }
    },
    clean: {
      dist: [
        'assets/js/scripts.min.js'
      ]
    }
  });

  // Load tasks
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-svgmin');
  grunt.loadNpmTasks('grunt-gulp');

  grunt.registerTask('xml-to-ical', 'Convert xml to iCal', function() {
      xml2iCal();
  });

  // Register tasks
  grunt.registerTask('default', [
    'clean',
    'uglify',
    'imagemin',
    'svgmin',
    'gulp',
    'xml-to-ical',
  ]);
  grunt.registerTask('dev', [
    'watch',
  ]);

};
