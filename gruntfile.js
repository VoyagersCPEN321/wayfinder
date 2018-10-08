/*
 *
 * Grunt task for compiling and linting ts
 * the task watches for changes in .ts files to compile
 * and lint changed files.
 * 
 * Copied from: https://brianflove.com/2016/03/29/typescript-express-node-js/
 * 
 */
module.exports = function(grunt) {
    "use strict";
  
    grunt.initConfig({
      ts: {
        app: {
          files: [{
            src: ["src/\*\*/\*.ts", "!src/.baseDir.ts", "!src/_all.d.ts"],
            dest: "."
          }],
          options: {
            module: "commonjs",
            noLib: false,
            target: "es6",
            sourceMap: false,
            rootDir: "src"
          }
        }
      },
      tslint: {
        options: {
          configuration: "tslint.json"
        },
        files: {
          src: ["src/\*\*/\*.ts"]
        }
      },
      watch: {
        ts: {
          files: ["js/src/\*\*/\*.ts", "src/\*\*/\*.ts"],
          tasks: ["ts", "tslint"]
        }
      }
    });
  
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-ts");
    grunt.loadNpmTasks("grunt-tslint");
  
    grunt.registerTask("default", [
      "ts",
      "tslint"
    ]);
  
  };