/* jshint node: true */
// ^ we need some node modules like path, require

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

var path = require('path');
var _config = require('./bower.json');


module.exports = function(grunt) {

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // Configurable paths for the application
    var appConfig = {
        app: require('./bower.json').appPath || 'app',
        dist: 'src/main/resources/static/dist',
        verbose: true
    };

    // Define the configuration for all the tasks
    grunt.initConfig({

        // Project settings
        yeoman: appConfig,

        // Project Configuration
        pkg: '<json:package.json>',

        // https://www.npmjs.com/package/grunt-bower-task
        bower: {
            install: {
                options: {
                    verbose: appConfig.verbose,
                    layout: 'byComponent',
                    targetDir: appConfig.dist,
                    cleanTargetDir: true,
                    cleanBowerDir: false
                }
            }
        },

        // Build site using jekyll
        exec: {
            jekyll: {
                cmd: 'jekyll build --trace'
            }
        },

        // Watches files for changes and runs tasks based on the changed files
        watch: {
            bower: {
                files: ['bower.json'],
                tasks: ['wiredep']
            },
            jekyll: {
                files: [
                    "_drafts/**/*",
                    "_includes/**/*",
                    "_layouts/**/*",
                    "_posts/**/*",
                    "css/**/*",
                    "js/**/*",
                    "_config.yml",
                    "*.html",
                    "*.md",
                ],
                tasks: ["exec:jekyll"]
            },
            js: {
                files: ['<%= yeoman.app %>/js/{,*/}*.js'],
                tasks: ['newer:jshint:all'],
                options: {
                    livereload: '<%= connect.options.livereload %>'
                }
            },
            jsTest: {
                files: ['test/spec/{,*/}*.js'],
                tasks: ['newer:jshint:test', 'karma']
            },
            styles: {
                files: ['<%= yeoman.app %>/css/{,*/}*.css'],
                tasks: ['newer:copy:styles', 'autoprefixer']
            },
            gruntfile: {
                files: ['Gruntfile.js']
            },
            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: [
                    '*.html',
                    "*.md",
                    "_drafts/**/*",
                    "_includes/**/*",
                    "_layouts/**/*",
                    "_posts/**/*",
                    "css/**/*",
                    "js/**/*",
                    "_config.yml",
                    '<%= yeoman.app %>/{,*/}*.html',
                    '.tmp/css/{,*/}*.css',
                    '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
                ]
            }
        },

        // The actual grunt server settings
        connect: {
            options: {
                port: 9000,
                // Change this to '0.0.0.0' to access the server from outside.
                hostname: 'localhost',
                livereload: 35728,
                base: '_site'
            },
            proxies: [{
                context: '/apps', // When the url contains this...
                host: 'madhu.noip.me', // Proxy to this host
                port: 8080,
                https: false,
                changeOrigin: true,
                xforward: false,
                headers: {
                    "x-custom-added-header": "value"
                }
            }, {
                context: '/services/api/', // When the url contains this...
                host: 'madhu.noip.me', // Proxy to this host
                port: 8080,
                https: false,
                changeOrigin: true,
                xforward: false,
                headers: {
                    "x-custom-added-header": "value"
                }
            }],
            livereload: {
                options: {
                    open: true,
                    middleware: function(connect, options) {
                        if (!Array.isArray(options.base)) {
                            options.base = [options.base];
                        }

                        var middlewares = [];

                        var fnLog = function(rq, rs, next) {
                            grunt.log.debug('hioo ' + rq.url);
                            return next();
                        }

                        // Setup the proxy
                        grunt.log.warn(require("grunt-connect-proxy/lib/utils").proxyRequest);

                        middlewares.push(require("grunt-connect-proxy/lib/utils").proxyRequest);

                        middlewares.push(fnLog);

                        // Serve static files.
                        options.base.forEach(function(base) {
                            middlewares.push(connect.static(base));
                        });
                        /* */
                        middlewares.push(connect.static('.tmp'));
                        middlewares.push(connect().use(
                            '/vendor',
                            connect.static('./vendor')
                        ));
                        middlewares.push(connect.static(appConfig.app));

                        return middlewares;
                    }
                }
            },
            test: {
                options: {
                    port: 7001,
                    middleware: function(connect) {
                        return [
                            connect.static('.tmp'),
                            connect.static('test'),
                            connect().use(
                                '/vendor',
                                connect.static('./vendor')
                            ),
                            connect.static(appConfig.app)
                        ];
                    }
                }
            },
            dist: {
                options: {
                    open: true,
                    base: '<%= yeoman.dist %>'
                }
            }
        },

        // Make sure code styles are up to par and there are no obvious mistakes
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: {
                src: [
                    'Gruntfile.js',
                    '<%= yeoman.app %>/js/{,*/}*.js'
                ]
            },
            test: {
                options: {
                    jshintrc: 'test/.jshintrc'
                },
                src: ['test/spec/{,*/}*.js']
            }
        },

        // Empties folders to start fresh
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        appConfig.dist,
                        '.tmp',
                        'vendor',
                        '<%= yeoman.dist %>/{,*/}*',
                        '!<%= yeoman.dist %>/.git{,*/}*'
                    ]
                }]
            },
            server: '.tmp',
            bower: {
                dot: true,
                src: [appConfig.dist + '/respond/*', '!' + appConfig.dist + '/respond/respond.min.js',
                    appConfig.dist + '/modernizr/*', '!' + appConfig.dist + '/modernizr/modernizr.js',
                    appConfig.dist + '/angular-ui-bootstrap/*', '!' + appConfig.dist + '/angular-ui-bootstrap/dist/**'
                ]
            }
        },

        // Add vendor prefixed styles
        autoprefixer: {
            options: {
                browsers: ['last 1 version']
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '.tmp/css/',
                    src: '{,*/}*.css',
                    dest: '.tmp/css/'
                }]
            }
        },

        // Automatically inject Bower components into the app
        wiredep: {
            app: {
                src: ['<%= yeoman.app %>/index.html'],
                exclude: /.js/,
                ignorePath: /\.\.\//
            }
        },

        // Renames files for browser caching purposes
        filerev: {
            dist: {
                src: [
                    '<%= yeoman.dist %>/js/{,*/}*.js',
                    '<%= yeoman.dist %>/css/{,*/}*.css',
                    '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
                    '<%= yeoman.dist %>/css/fonts/*'
                ]
            }
        },

        // Reads HTML for usemin blocks to enable smart builds that automatically
        // concat, minify and revision files. Creates configurations in memory so
        // additional tasks can operate on them
        useminPrepare: {
            html: '<%= yeoman.app %>/index.html',
            options: {
                dest: '<%= yeoman.dist %>',
                flow: {
                    html: {
                        steps: {
                            js: ['concat', 'uglifyjs'],
                            css: ['cssmin']
                        },
                        post: {}
                    }
                }
            }
        },

        // Performs rewrites based on filerev and the useminPrepare configuration
        usemin: {
            html: ['<%= yeoman.dist %>/{,*/}*.html'],
            css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
            options: {
                assetsDirs: ['<%= yeoman.dist %>', '<%= yeoman.dist %>/images']
            }
        },

        // The following *-min tasks will produce minified files in the dist folder
        // By default, your `index.html`'s <!-- Usemin block --> will take care of
        // minification. These next options are pre-configured if you do not wish
        // to use the Usemin blocks.
        // cssmin: {
        //   dist: {
        //     files: {
        //       '<%= yeoman.dist %>/styles/main.css': [
        //         '.tmp/styles/{,*/}*.css'
        //       ]
        //     }
        //   }
        // },
        // uglify: {
        //   dist: {
        //     files: {
        //       '<%= yeoman.dist %>/scripts/scripts.js': [
        //         '<%= yeoman.dist %>/scripts/scripts.js'
        //       ]
        //     }
        //   }
        // },
        // concat: {
        //   dist: {}
        // },

        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/images',
                    src: '{,*/}*.{png,jpg,jpeg,gif}',
                    dest: '<%= yeoman.dist %>/images'
                }]
            }
        },

        svgmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/images',
                    src: '{,*/}*.svg',
                    dest: '<%= yeoman.dist %>/images'
                }]
            }
        },

        htmlmin: {
            dist: {
                options: {
                    collapseWhitespace: true,
                    conservativeCollapse: true,
                    collapseBooleanAttributes: true,
                    removeCommentsFromCDATA: true,
                    removeOptionalTags: true
                },
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.dist %>',
                    src: ['*.html', 'views/{,*/}*.html'],
                    dest: '<%= yeoman.dist %>'
                }]
            }
        },

        // ng-annotate tries to make the code safe for minification automatically
        // by using the Angular long form for dependency injection.
        ngAnnotate: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '.tmp/concat/scripts',
                    src: ['*.js', '!oldieshim.js'],
                    dest: '.tmp/concat/scripts'
                }]
            }
        },

        // Replace Google CDN references
        cdnify: {
            dist: {
                html: ['<%= yeoman.dist %>/*.html']
            }
        },

        // Copies remaining files to places other tasks can use
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= yeoman.app %>',
                    dest: '<%= yeoman.dist %>',
                    src: [
                        '*.{ico,png,txt}',
                        '.htaccess',
                        '*.html',
                        'views/{,*/}*.html',
                        'images/{,*/}*.{webp}',
                        'fonts/{,*/}*.*'
                    ]
                }, {
                    expand: true,
                    cwd: '.tmp/images',
                    dest: '<%= yeoman.dist %>/images',
                    src: ['generated/*']
                }, {
                    expand: true,
                    cwd: 'vendor/bootstrap/dist',
                    src: 'fonts/*',
                    dest: '<%= yeoman.dist %>'
                }]
            },
            styles: {
                expand: true,
                cwd: '<%= yeoman.app %>/styles',
                dest: '.tmp/styles/',
                src: '{,*/}*.css'
            }
        },

        // Run some tasks in parallel to speed up the build process
        concurrent: {
            server: [
                'copy:styles'
            ],
            test: [
                'copy:styles'
            ],
            dist: [
                'copy:styles',
                'imagemin',
                'svgmin'
            ]
        },

        // Test settings
        karma: {
            unit: {
                configFile: 'test/karma.conf.js',
                singleRun: true
            }
        },

        // Replace HTML text

        replace: {
            dist: {
                overwrite: true,
                src: '<%= yeoman.dist %>/index.html',
                replacements: [{
                    from: 'footer.lastModified',
                    to: 'Today'
                }]
            }
        }
    });

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt, {
        pattern: ['grunt-contrib-*']
    });

    /*
         Tasks added later, remove if not needed.
     */
    grunt.loadNpmTasks('grunt-wiredep');
    grunt.loadNpmTasks('grunt-usemin');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-ng-annotate');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-google-cdn');
    grunt.loadNpmTasks('grunt-filerev');
    grunt.loadNpmTasks('grunt-connect-proxy');
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-svgmin');

    grunt.registerTask('hello', 'say hello', function() {
        grunt.log.writeln('appConfig json:' + JSON.stringify(appConfig));
    });

    // Run npm install for angular ui
    grunt.registerTask('uiboot-npm', function(name) {
        var cwd = './' + appConfig.dist + '/angular-ui-bootstrap/';
        var exec = require('child_process').exec;
        var done = grunt.task.current.async(); // this.async();
        grunt.log.writeln('Please wait while we install local npm dependencies for angular-ui ...');
        // http://stackoverflow.com/questions/13957303/nodejs-grunt-child-process-callback-function-example
        exec('npm install', {
            cwd: cwd
        }, function(err, std, stderr) {
            grunt.log.writeln(std);
            grunt.log.writeln(stderr);
            done(err);
        });
    });

    grunt.registerTask('uiboot-grunt', function(name) {
        var cwd = './' + appConfig.dist + '/angular-ui-bootstrap/';
        var uiBootGrunt = require(cwd + 'Gruntfile.js')(grunt);
        uiBootGrunt.file.setBase(cwd);
        require('load-grunt-tasks')(uiBootGrunt);
        uiBootGrunt.task.run(name);
    });

    grunt.registerTask('serve', 'Compile then start a connect web server', function(target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'connect:dist:keepalive']);
        }

        grunt.task.run([
            'clean:server',
            'wiredep',
            'concurrent:server',
            'autoprefixer',
            'configureProxies:server',
            'connect:livereload',
            'watch'
        ]);
    });

    grunt.registerTask('server', 'DEPRECATED TASK. Use the "serve" task instead', function(target) {
        grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
        grunt.task.run(['serve:' + target]);
    });

    grunt.registerTask('test', [
        'clean:server',
        'concurrent:test',
        'autoprefixer',
        'connect:test',
        'karma'
    ]);

    grunt.registerTask('download-resources',[
        'clean:dist',
        'bower:install',
        'uiboot-npm',
        'uiboot-grunt:default',
    ]);

    grunt.registerTask('build', [
        'clean:bower',
        'wiredep',
        'useminPrepare',
        'concurrent:dist',
        'autoprefixer',
 //       'concat',
        'ngAnnotate',
        'copy:dist',
        'replace:dist',
        'cdnify',
 //       'cssmin',
 //       'uglify',
        'filerev',
        'usemin',
        'htmlmin',
//        'exec:jekyll'
   ]);

    grunt.registerTask('default', [
        'newer:jshint',
        'test',
        'build'
    ]);
};