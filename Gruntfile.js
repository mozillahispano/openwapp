// Generated on 2013-03-06 using generator-webapp 0.1.5
'use strict';
var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir));
};

module.exports = function (grunt) {
  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.initConfig({
    openwappPaths: {
      app: 'app',
      dist: 'dist'
    },

    openwappVersion: '',

    /* Local Project configuration (per developer) */
    properties: grunt.file.isFile('grunt.local.json') ?
                  grunt.file.readJSON('grunt.local.json') : {},

    simulator: {
      b2gbin: '<%= properties.b2g_bin_path %>/b2g-bin'
    },

    gaia: {
      home: '<%= properties.gaia_homepath %>'
    },

   /* Project tasks */

    watch: {
      compass: {
        files: ['<%= openwappPaths.app %>/styles/{,*/}*.{scss,sass}'],
        tasks: ['compass']
      },
      handlebars: {
        files: [
          '<%= openwappPaths.app %>/scripts/templates/*.hbs',
          '<%= openwappPaths.app %>/emoji/*.hbs'
        ],
        tasks: 'handlebars:compile'
      },
      dist: {
        files: [
          '<%= openwappPaths.app %>/scripts/{,*/}*.js',
          '<%= .tmp/scripts/*.js',
        ],
        tasks: 'dist'
      }
    },

    connect: {
      options: {
        port: 9000,
        // change this to '0.0.0.0' to access the server from outside
        hostname: 'localhost'
      },
      server: {
        options: {
          middleware: function (connect) {
            return [
              mountFolder(connect, '.tmp'),
              mountFolder(connect, 'app')
            ];
          }
        }
      },
      test: {
        options: {
          port: 9002,
          middleware: function (connect) {
            return [
              mountFolder(connect, '.tmp'),
              mountFolder(connect, 'test')
            ];
          }
        }
      },
      dist: {
        options: {
          middleware: function (connect) {
            return [
              mountFolder(connect, 'dist')
            ];
          }
        }
      }
    },

    open: {
      server: {
        path: 'http://localhost:<%= connect.options.port %>'
      },
      test: {
        path: 'http://localhost:<%= connect.test.options.port %>'
      }
    },

    clean: {
      dist: ['.tmp', '<%= openwappPaths.dist %>/*'],
      server: '.tmp'
    },

    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        'Gruntfile.js',
        '<%= openwappPaths.app %>/scripts/{,*/}*.js',
        '!<%= openwappPaths.app %>/scripts/l10n.js',
        '!<%= openwappPaths.app %>/scripts/vendor/*',
        '!<%= openwappPaths.app %>/scripts/templates.js',
        'test/spec/{,*/}*.js'
      ]
    },

    mocha: {
      all: {
        options: {
          reporter: 'Spec',
          run: false,
          urls: ['http://localhost:<%= connect.test.options.port %>/index.html']
        }
      }
    },

    compass: {
      options: {
        sassDir: '<%= openwappPaths.app %>/styles',
        cssDir: '<%= openwappPaths.app %>/styles',
        imagesDir: '<%= openwappPaths.app %>/images',
        javascriptsDir: '<%= openwappPaths.app %>/scripts',
        fontsDir: '<%= openwappPaths.app %>/styles/fonts',
        importPath: 'app/components',
        relativeAssets: true
      },
      dist: {},
      server: {
        options: {
          debugInfo: true
        }
      }
    },

    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= openwappPaths.app %>/images',
          src: '**/{,*/}*.{png,jpg,jpeg}',
          dest: '<%= openwappPaths.dist %>/images'
        }]
      }
    },

    copy: {
      build: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= openwappPaths.app %>',
          dest: '<%= openwappPaths.dist %>',
          src: [
            /** COMPONENTS - Extracted from main.js config **/
            'components/requirejs/require.js',
            'components/zepto/zepto.min.js',
            'components/zepto/zepto.js',
            'components/underscore/underscore-min.js',
            'components/backbone/backbone.js',
            'components/handlebars/handlebars.min.js',
            'components/PhoneNumber.js/PhoneNumber.js',
            'components/PhoneNumber.js/PhoneNumberMetaData.js',
            'components/coseme/dist/coseme.js',
            'components/fxosRate/fxosrate.js',
            /** END OF COMPONENTS **/
            'styles/main.css',
            'icons/**/*.{png,jpg}',
            'scripts/**/*.js',
            'scripts/**/*.json',
            'locales/*.properties',
	    'locales/*.ini',
            'emoji/*.js',
            'emoji/*.css',
            'emoji/*.png',
            '*.{ico,txt}',
            '*.html',
            'manifest.webapp'
          ]
        }, 
	 {
          expand: true,
	  dot: true,
          cwd: '<%= openwappPaths.app %>/components/fxosRate/',
          dest: '<%= openwappPaths.dist %>',
	  src: 'locales/*.properties'

        },{
          expand: true,
          cwd: '.tmp',
          dest: '<%= openwappPaths.dist %>',
          src: [
            'styles/**/*.css',
            'scripts/**/*.js',
          ]
        },
        {
          expand: true,
          cwd: '<%= openwappPaths.app %>/images',
          src: '**/*.{png,jpg,jpeg}',
          dest: '<%= openwappPaths.dist %>/images'
        }
        ]
      }
    },

    bower: {
      all: {
        rjsConfig: '<%= openwappPaths.app %>/scripts/main.js'
      }
    },

    handlebars: {
      compile: {
        files: {
          '.tmp/scripts/templates.js': [
            '<%= openwappPaths.app %>/scripts/templates/*.hbs',
            '<%= openwappPaths.app %>/emoji/*.hbs'
          ],
          '<%= openwappPaths.app %>/scripts/templates.js': [
            '<%= openwappPaths.app %>/scripts/templates/*.hbs',
            '<%= openwappPaths.app %>/emoji/*.hbs'
          ]
        },
        options: {
          namespace: 'Handlebars',
          amd: true,
          processName: function (filename) {
            // funky name processing here
            var parts = filename.split('/');
            filename = parts[parts.length - 1];
            return filename.replace(/\.hbs$/, '');
          }
        }
      }
    },

    cover: {
      compile: {
        files: {
          'test/cov/*.js': ['app/scripts/**/*.js'],
          'test/cov/templates.js': ['.tmp/scripts/templates.js']
        }
      }
    },

    shell: {

      ensureLinkedInGaia: {
        command: 'if [ ! -d <%= gaia.home %>/apps/openwapp ]; then' +
                 ' ln -s "$(pwd)/dist" "<%= gaia.home %>/apps/openwapp";' +
                 'fi',
        options: {
          stdout: true
        }
      },

      launchB2G: {
        command: '<%= simulator.b2gbin %> -profile ' +
                 '"<%= gaia.home %>/profile" ' +
                 '--screen=320x480@72 -jsconsole'
      },

      killB2G: {
        command: 'killall b2g-bin'
      },

      makeGaiaDebug: {
        command: 'DEBUG=1 NOFTU=1 make',
        options: {
          stdout: true,
          execOptions: {
            cwd: '<%= gaia.home %>'
          }
        }
      },

      makeGaia: {
        command: 'NOFTU=1 make',
        options: {
          stdout: true,
          execOptions: {
            cwd: '<%= gaia.home %>'
          }
        }
      },

      ensureDistributionFolderExists: {
        command: 'if [ ! -d "<%= gaia.home %>/distribution" ]; then ' +
                  'mkdir "<%= gaia.home %>/distribution";' +
                  'fi',
        options: {
          stdout: true
        }
      },

      generateContacts: {
        command: 'if [ -f "$(pwd)/contacts.json" ]; then ' +
                 'cp "$(pwd)/contacts.json" ' +
                 '"<%= gaia.home %>/distribution/contacts.json";' +
                 'fi',
        options: {
          stdout: true
        }
      },

      cleanContacts: {
        command: 'rm "<%= gaia.home %>/distribution/contacts.json";',
        options: {
          stdout: true
        }
      },

      pushAllToDevice: {
        command: 'NOFTU=1 make install-gaia && adb reboot',
        options: {
          stdout: true,
          execOptions: {
            cwd: '<%= gaia.home %>'
          }
        }
      },

      pushToDevice: {
        command: 'NOFTU=1 BUILD_APP_NAME=openwapp make install-gaia',
        options: {
          stdout: true,
          execOptions: {
            cwd: '<%= gaia.home %>'
          }
        }
      },

      resetDevice: {
        command: 'NOFTU=1 make reset-gaia',
        options: {
          stdout: true,
          execOptions: {
            cwd: '<%= gaia.home %>'
          }
        }
      },

      removeGaiaProfile: {
        command: 'rm -r profile',
        options: {
          stdout: true,
          failOnError: false,
          execOptions: {
            cwd: '<%= gaia.home %>'
          }
        }
      },

      enableRemoteDebugging: {
        command: './enable-remote-debugging.sh "<%= gaia.home %>"',
        options: {
          stdout: true,
          failOnError: true,
        }
      },

      getVersion: {
        command: 'git describe --all --long --dirty',
        options: {
          callback: function (err, stdout, stderr, cb) {
            stdout = stdout.trim();
            console.log('Version: ' + stdout);
            grunt.config.set('openwappVersion', stdout);
            cb();
          }
        }
      },

      getLatestTag: {
        command: 'git describe --abbrev=0 --tags',
        options: {
          callback: function (err, stdout, stderr, cb) {
            stdout = stdout.trim();
            // If we have a leading 'v' in the version, remove it
            if (stdout.substring(0, 1) === 'v') {
              stdout = stdout.substring(1);
            }
            console.log('Latest tag: ' + stdout);
            grunt.config.set('openwappLatestTag', stdout);
            cb();
          }
        }
      }
    },

    'string-replace': {
      writeVersion: {
        files: {
          '<%= openwappPaths.dist %>/scripts/templates/helpers.js':
            '<%= openwappPaths.dist %>/scripts/templates/helpers.js'
        },
        options: {
          replacements: [
		{
	            pattern: '{{currentCommit}}',
	            replacement: '<%= openwappVersion %>'
          	},
		{
	            pattern: '{{latestTag}}',
	            replacement: '<%= openwappLatestTag %>'
          	},

	]
        }
      },
      writeLatestTag: {
        files: {
          '<%= openwappPaths.dist %>/scripts/global.js':
            '<%= openwappPaths.dist %>/scripts/global.js'
        },
        options: {
          replacements: [{
            pattern: '{{latestTag}}',
            replacement: '<%= openwappLatestTag %>'
          }]
        }
      }
    }

  });

  grunt.renameTask('regarde', 'watch');

  grunt.registerTask('checkProperties', function () {
    return grunt.config.requires('properties.gaia_homepath');
  });

  grunt.registerTask('server', function (target) {
    if (target === 'dist') {
      grunt.task.run([
        'build',
        'open:server',
        'connect:dist:keepalive'
      ]);
    } else if (target === 'test') {
      grunt.task.run([
        'clean:server',
        'handlebars:compile',
        'cover:compile',
        'compass:server',
        'connect:test',
        'open:test',
        'watch'
      ]);
    } else {
      grunt.task.run([
        'jshint',
        'clean:server',
        'handlebars:compile',
        'compass:server',
        'connect:server',
        //'open:server',
        'watch'
      ]);
    }
  });

  grunt.registerTask('test', [
    'jshint',
    'clean:server',
    'handlebars:compile',
    'compass',
    'connect:test',
    'mocha'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'handlebars:compile',
    'compass:dist',
    // 'imagemin',
    'copy:build',
  ]);

  grunt.registerTask('dist', [
    'clean:dist',
    'handlebars:compile',
    'compass:dist',
    // 'imagemin',
    'copy:build',
    'shell:getVersion',
    'shell:getLatestTag',
    'string-replace:writeVersion',
    'string-replace:writeLatestTag'
  ]);

  grunt.registerTask('simulate', 'Launch with B2G simulator', function () {
    grunt.log.write('Using ' + grunt.config.get('simulator.b2gbin'));
    grunt.task.run([
      'checkProperties',
      'shell:removeGaiaProfile',
      'build',
      'shell:ensureLinkedInGaia',
      'shell:killB2G',
      'shell:ensureDistributionFolderExists',
      'shell:generateContacts',
      'shell:makeGaia',
      'shell:enableRemoteDebugging',
      'shell:launchB2G'
    ]);
  });

  grunt.registerTask('clean-contacts', 'Clean generated contacts', function () {
    if (grunt.file.isFile('contacts.json')) {
      grunt.file.copy('contacts.json', 'contacts.json.sample');
      grunt.file.delete('contacts.json');
    }
    grunt.task.run(['shell:cleanContacts']);
  });

  grunt.registerTask('push-clean', 'Install in device ' +
                     '(rebooting and cleaning it)', function () {
    grunt.task.run([
      'checkProperties',
      'shell:removeGaiaProfile',
      'build',
      'shell:ensureLinkedInGaia',
      'shell:ensureDistributionFolderExists',
      'shell:generateContacts',
      'shell:enableRemoteDebugging',
      'shell:pushAllToDevice'
    ]);
  });

  grunt.registerTask('push-hard', 'Install and reset the device ' +
                     ' (use when you are getting desperate)', function () {
    grunt.task.run([
      'checkProperties',
      'shell:removeGaiaProfile',
      'build',
      'shell:ensureLinkedInGaia',
      'shell:ensureDistributionFolderExists',
      'shell:generateContacts',
      'shell:enableRemoteDebugging',
      'shell:resetDevice',
    ]);
  });

  grunt.registerTask('push', 'Install in device ' +
                     '(only the OPENWAPP application)', function () {
    grunt.task.run([
      'checkProperties',
      'build',
      'shell:ensureLinkedInGaia',
      'shell:ensureDistributionFolderExists',
      'shell:generateContacts',
      'shell:enableRemoteDebugging',
      'shell:pushToDevice'
    ]);
  });

  grunt.registerTask('default', [
    'jshint',
    'test',
    'build'
  ]);
};
