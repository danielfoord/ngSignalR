module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    copy: {
      main: {
        src: 'src/ngSignalR.js',
        dest: 'dist/ngSignalR-<%= pkg.version %>.js',
      },
    },
    karma: {
      unit: {
        configFile: 'karma.conf.js'
      }
    },
    jshint: {
      all: ['src/ngSignalR.js'],
      options: {
        node:false
      } 
    },
    uglify:{
      options: {
        banner: '/*<%= pkg.name %>-<%= pkg.version %> | <%= grunt.template.today("dd-mm-yyyy") %> | Copyright (C) <%= pkg.author.name %> <%= pkg.licenses[0].type %> License*/\n'
      },
      directives:{
        files:{
          'dist/ngSignalR-<%= pkg.version %>.min.js':['src/ngSignalR.js']
        }
      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-rename');
  grunt.loadNpmTasks('grunt-karma');

  grunt.registerTask('default', ['jshint', 'karma', 'copy', 'uglify']);
  grunt.registerTask('test', ['jshint', 'karma']);
};
