/* istanbul ignore next */
module.exports = function (grunt) {
    var util = require("util");
    var revision = "";

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        typescript: {
            server: {
                src: ['src/server/**/*.ts', '!src/server/tests/**'],
                dest: './dist/',
                options: {
                    module: 'commonjs', //or commonjs
                    target: 'es5', //or es3
                    base_path: 'src/server',
                    noImplicitAny: true,
                    comments: true
                }
            },
            webapp: {
                src: ['src/webapp/**/*.ts'],
                dest: './dist/public/js',
                options: {
                    module: 'amd', //or commonjs
                    target: 'es5', //or es3
                    base_path: 'src/webapp',
                    sourcemap: true,
                    noImplicitAny: true
                }
            },
            server_tests: {
                src: ['src/server/tests/**/*.ts'],
                dest: './dist',
                options: {
                    module: 'commonjs', //or commonjs
                    target: 'es5', //or es3
                    base_path: 'src/server',
                    noImplicitAny: true
                }
            }
        },
        stylus: {
            compile: {
                files: [{
                    expand: true,
                    flatten: true,
                    ext: ".css",
                    src: ['styles/*.styl'],
                    dest: 'dist/public/css/'
                }]
            }
        },
        compress: {
            build: {
                options: {
                    rootDir: "package",
                    mode: "tgz",
                    archive: "<%= pkg.name %>.tgz"
                },
                src: "package/**"
            },
            docs: {
              options: {
                    rootDir: "docs",
                    mode: "tgz",
                    archive: "<%= pkg.name %>-docs.tgz"
                },
                src: "docs/**"
            }
        },
        copy: {
            dist: {
                files: [
                    { src: "libs/**", dest: "dist/public/js/",  },
                    { src: "images/**", dest: "dist/public/",  },
                    { src: "templates/**", dest: "dist/",  },
                    { src: "fonts/**", dest: "dist/public/",  },
                    { src: "**/*.css", dest: "dist/public/css/", cwd: "styles/", expand: true }
                ]
            },
            build: {
                files: {
                    "package/": ["package.json", "README.md", "LICENSE", "dist/**", "views/**", "styles/**", "public/**"]
                }
            },
            docs: {
                files: {
                    "docs/": ["README.md", "LICENSE"]
                }
            }
        },
        clean: ['dist', 'package', './<%= pkg.name %>.tgz'],
        bump: {
            file: 'package.json',
            options: {
                version: function (old, type) {
                    var today = new Date();
                    var first = new Date(today.getFullYear(), 0, 1);
                    var theDay = Math.round(((today - first) / 1000 / 60 / 60 / 24) + 0.5, 0);
                    return util.format("0.1.%d-%s", theDay, revision); // Bump based on a `type` argument
                }
            }
        },
        vows: {
            server: {
                src: ["dist/tests/suites/*.js"],
                options : {
                  reporter : "spec"
                }
            }
        },
        instrument : {
          files : "dist/**/*.js",
          options : {
            lazy : true,
            basePath : 'dist/instrument/'
          }
        },
        reloadTasks : {
            rootPath : 'dist/instrument/dist'
        }
    });

    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-zip');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-bump');
    grunt.loadNpmTasks('grunt-contrib-yuidoc');
    grunt.loadNpmTasks('grunt-contrib-stylus');
    grunt.loadNpmTasks('grunt-vows-runner');

    grunt.registerTask('get-revision', 'Get revision.', function () {
        var done = this.async();

        var child_process = require("child_process");

        child_process.exec("git rev-parse --short HEAD", function (err, stdout, stderr) {
            if (err) {
                grunt.log.error(err);
                grunt.fail.warn("Failed to get git revision");
                done();
            } else {
                revision = stdout.toString().trim();
                done();
            }
        });
    });

    grunt.registerTask('run-istanbul', 'Get revision.', function () {
        var done = this.async();

        var cli = require("istanbul/lib/cli");

        console.log(cli);

        cli.runToCompletion(["cover", "vows"], done);
    });

    // Default task(s).
    grunt.registerTask('default', ['typescript:server', 'typescript:webapp' , 'copy:dist', 'stylus']);
    grunt.registerTask('build', ['clean', 'get-revision', 'bump', 'default', 'copy:build', 'compress:build']);
    grunt.registerTask('docs', ['yuidoc', 'copy:docs', 'compress:docs']);
    grunt.registerTask('tests', ['clean', 'default', 'typescript:server_tests', 'vows:server']);
};

