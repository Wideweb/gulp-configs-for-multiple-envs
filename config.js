var _ = require('lodash'); 
var gutil = require('gulp-util')

var env = gutil.env.env || 'development';

var paths = { 
    src: { 
        js: 'app/**/*.js',  
        html: 'app/index.html', 
        templates: 'app/**/*.html',
        css: [
            'app/**/*.css'
        ],
        libs: [
            './node_modules/angular/angular.js'
        ]
    }, 
    dest: { 
        js: 'dist/', 
        constants: 'dist/', 
        html: 'dist/', 
        css: 'dist/',
        templates: 'dist/',
        libs: 'dist/libs/'
    } 
};

var constants = {
    default: {
        apiHost: '',
        equipmentApi: ''
    },
    development: {
        apiHost: 'http://localhost:9050',
        equipmentApi: 'http://localhost:9051'
    },
    staging: {
        apiHost: 'http://staging.example.com/api/',
        equipmentApi: 'http://staging.equipmentApi.com/api/'
    },
    production: {
        apiHost: 'http://example.com/api/',
        equipmentApi: 'http://example.equipmentApi.com/api/'
    }
};

var plugin = {
    default: {
        js: {
            uglify: {
                mangle: true
            }
        }
    },
    development: {
        js: {
            uglify: {
                mangle: false
            }
        }
    },
    staging: {
        js: {
            uglify: {
                mangle: true
            }
        }
    },
    production: {
        js: {
            uglify: {
                mangle: true
            }
        }
    }
};

var run = {
    default: {
        js: {
            uglify: false
        },
        css: {
            cssnano: false
        }
    },
    development: {
        js: {
            uglify: false
        },
        css: {
            cssnano: false
        }
    },
    staging: {
        js: {
            uglify: true
        },
        css: {
            cssnano: true
        }
    },
    production: {
        js: {
            uglify: true
        },
        css: {
            cssnano: true
        }
    }
};


var runOpts = _.merge( {}, run.default, run[ env ] );
var pluginOpts = _.merge( {}, plugin.default, plugin[ env ] );
var constantsOpts = _.merge( {}, constants.default, constants[ env ]);

//module.exports is the object that's actually returned as the result of a require call.
module.exports.paths = paths;
module.exports.constants = constantsOpts;
module.exports.run = runOpts;
module.exports.plugin = pluginOpts;