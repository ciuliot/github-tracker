module.exports = function (grunt) {
    var util = require("util");
    var revision = "";

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        typescript: {
            base: {
                src: ['src/config/**/*.ts', 'src/controllers/**/*.ts', 'src/initializers/**/*.ts', 'src/models/**/*.ts', 'src/*.ts'],
                dest: './dist/',
                options: {
                    module: 'commonjs', //or commonjs
                    target: 'es5', //or es3
                    base_path: 'src',
                    noImplicitAny: true
                }
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
                files: {
                    "dist/": ["public/**"]
                }
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
        bumpup: {
            file: 'package.json',
            options: {
                version: function (old, type) {
                    var today = new Date();
                    var first = new Date(today.getFullYear(), 0, 1);
                    var theDay = Math.round(((today - first) / 1000 / 60 / 60 / 24) + 0.5, 0);
                    return util.format("0.1.%d-%s", theDay, revision); // Bump based on a `type` argument
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-zip');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-bumpup');
    grunt.loadNpmTasks('grunt-contrib-yuidoc');

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

    // Default task(s).
    grunt.registerTask('default', ['typescript', 'copy:dist']);
    grunt.registerTask('build', ['clean', 'get-revision', 'bumpup', 'default', 'copy:build', 'compress:build']);
    grunt.registerTask('docs', ['yuidoc', 'copy:docs', 'compress:docs']);
};

