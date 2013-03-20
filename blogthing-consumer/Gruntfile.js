module.exports = function (grunt) {
  "use strict";

  grunt.initConfig({
      "watch": {
          "all": {
              "files": [ "browser/**.less", "browser/**.jade", "browser/**.js" ]
            , "tasks": [ "jade:dev", "less:dev", "pakmanager:browser" ]
          }
      }
    , "develop": {
          "server": {
              "file": "bin/consumer.js"
          }
      }
    , "jade": {
          "dev": {
              "files": {
                  "public/index.html": "browser/index.jade"
              }
          }
      }
    , "less": {
          "dev": {
              "files": {
                  "public/style.css": "browser/style.less"
              }
          }
      }
    , "pakmanager": {
          "browser": {
              "files": {
                  "public/pakmanaged.js": "browser/browser.js"
              }
          }
      }
  });
  // uglify
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-develop');
  grunt.loadNpmTasks('grunt-pakmanager');
  //grunt.loadTasks('grunt-tasks/');
  grunt.registerTask('make', ["jade:dist", "less:dist", "pakmanager:browser"]);
  grunt.registerTask('build', ["jade:dev", "less:dev", "pakmanager:browser"]);
  grunt.registerTask('default', ['build', 'develop','watch']);
};
