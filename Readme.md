# OpenWapp HTML5 webapp

* __Note__: We are now the official repo. Yay!

# Workstation configuration

## Requirements

* Node.js (0.10.x)
* Ruby
* Firefox (Nightly)

## Introduction

We are using the following setup

* Node for running grunt (make-like tool), which we use to run tests and builds
* Ruby for running compass (css compiler)
* Bower for managing client-side dependencies

The setup process is a bit convoluted but needs to be done only once.

## How to install the requirements

### Install Node.js

Download it from [nodejs.org](http://nodejs.org/). Make sure to not select the
0.10.

### Install Bower and Grunt npm modules globally:

```sh
$ npm install -g grunt-cli bower
```
* Note: add `sudo` if you are on Linux. It is not needed on MacOS.

### Install needed modules from npm, RubyGems and Bower:

```sh
$ npm install
$ gem install bundler && bundle install
$ bower install
```

## Troubleshooting

If after updating the code the tests or jshint are failing, maybe you have
outdated dependencies. First thing to do is to update all the dependencies:

```sh
$ npm install
$ bundle install
$ bower install
```

Sometimes `npm install` does weird things, if you keep receiving errors when
executing it, just remove the `node_modules` folder inside the repo and execute
`npm install` again.

To check that all the dependencies are correctly installed, do a `npm list` and
check that no errors appear.

# Developing

## How to run

Run a webserver which watches for file changes and auto compiles SASS/CoffeScript
code:

```sh
$ grunt server
```

You can leave the console open while you work and it will keep compiling the
assets, and reloading the page automatically.

You can open this in Firefox Nightly to debug:
[http://localhost:9000](http://localhost:9000).

## How to run unit tests and jshint (syntax checking [aka lint])

Execute all the JSHint checks:

```sh
$ grunt jshint
```

Execute all the tests from the command line via PhantomJS:

```sh
$ grunt test
```

Or just run a webserver to be able execute the tests from any browser:

```sh
$ grunt server:test
```

The server will be listening at [http://localhost:9002](http://localhost:9002)

#### Important note

Before committing code, be sure that the code passes the JSHint checks and all
the tests. You can run `grunt` with no arguments to check that everything is
ok.

To install a git hook that automatically runs `grunt` before every commit,
create a file called `.git/hooks/pre-commit` with the following content:

```sh
#!/bin/sh

grunt jshint > /dev/null 2>&1
[ $? -ne 0 ] && echo "There are JSHint errors... aborting commit" && exit 1

grunt test > /dev/null 2>&1
[ $? -ne 0 ] && echo "The tests are failing... aborting commit" && exit 1

exit 0
```

**Note:** Don't forget to give execution permissions to this file!

## How to deploy

Run a server with the deployable version of the app:

```sh
$ grunt server:dist
```

This will have all the minimized JS and CSS code into single files.

To create the distributable code, just run:

```sh
$ grunt
```

This will create all the HTML, CSS, JS and assets into the `dist/` folder.



# Code Structure

## MVC-like system

We are using Backbone as the MVC-like system, sometimes referred to as MVV when
it's in the client side since there are not really controllers.

## Templating system

Due to the limitations of the OWD we are using Handlebars instead of the more
commonly used Underscore system. Handlebars has the advantage of pre-compiling
the templates.

Templates use extension `.hbs`. Documentation can be found in
[Handlebars](http://handlebarsjs.com/expressions.html) and
[mustache](http://mustache.github.com/) sites.

Javascript can't be used in templates, although Helpers can be used when extra
functionality is needed.

During development, templates are compiled by grunt into `.tmp/scripts/templates.js`. This is very useful for debugging.





# Testing

## Unit Testing

We are using [mocha](http://visionmedia.github.com/mocha/) for unit testing. We
are using the BDD mode of mocha. We complement it with [chaijs](http://chaijs.com/) 
for expectations (e.g. `expect(variable).to.equal("pepe")`).

Test cases are stored in `test/spec` and should follow the same directory
structure as the matching javascript files.

The test suite is defined in `test/index.html`.

### Running tests

Run tests in command-line using `grunt test` or run them in a web page using
`grunt server:test`. The latter method allows for easily viewing the results,
choosing one particular test to repeat etc.

### Example test case using mocha:

```js
'use strict';
describe('models/auth tests', function () {
  var AuthModel;

  before(function (done) {
    require([
      'models/auth'
    ], function (model) {
      AuthModel = model;
      done();
    });
  });

  it('should initialize with empty parameters', function () {
    var auth = new AuthModel();
    expect(auth.get('loggedIn')).to.equal(null);
    expect(auth.get('userId')).to.equal(null);
    expect(auth.get('password')).to.equal(null);
  });
});
```
### Example stub usage:

```js
var credStub = sinon.stub(authStorage, 'load');
credStub.returns({userId: 'chuck', password: 'pass'});
//
// now, any call to authStorage.load will use the stub
// ...
//
credStub.restore(); // restore normal authStorage function
```

### Example mock usage:

```js
// we use prototype because we want to intercept all instances
var mock = sinon.mock(AuthModel.prototype);
mock.expects('_navigate').withArgs('index').once();

var auth = new AuthModel();
auth.set({ loggedIn: true });

// Always call verify() to run expectations
mock.verify();
```

### Example mocking the clock to travel to the future:

```js
// Initialize the clock stub
var clock = sinon.useFakeTimers();

this.view.render();

// Travel 16 seconds to the future
clock.tick(16000);

// Do the expectations
expect(this.view.$el.find('h3')).to.have.length(0);

// Always restore the clock!
clock.restore();
```


### When to use what

Mocks documentation is in [Sinonjs site](http://sinonjs.org/docs).

* Use `expect` to verify that return values comply with what is required 
* Use [stubs](http://sinonjs.org/docs/#stubs) when you want to return static objects 
  or values for some calls.
* Use [mocks](http://sinonjs.org/docs/#mocks) when you want to test the behaviour of a method.

### Notes about testing

Use of globals is disallowed in tests by default. This is enforced by mocha and
will be triggered during testing. Configuration for allowed globals is in
`test/index.html`.


## Testing with simulator

We are working with a target of v1_0_1 for the Gaia user interface (the interface that you see 
on the device).
The standalone simulator allows you to choose a specific version so it's ideal for us.
* They are all in [Mozilla B2G nightly repository](http://ftp.mozilla.org/pub/mozilla.org/b2g/nightly/)

### Install the simulator

We will be using the latest `b2g18_v1_0_1` (Gecko v18, Gaia version 1.0.1), get 
[it from mozilla](http://ftp.mozilla.org/pub/mozilla.org/b2g/nightly/latest-mozilla-b2g18_v1_0_1/)

* Download and install the package for your system

### Install gaia

Clone the repository
```sh
  git clone https://github.com/mozilla-b2g/gaia.git
```

### Create local configuration file

Make sure to have a `grunt.local.json` file that has the correct paths for your B2G 
installation and your gaia installation.

There is a sample file that you should copy. Your local file is not to be uploaded to the git repo.

### Launch the simulator

Launch the simulator using:
```sh
  grunt simulate
```

If you want to have some pre-generated contacts, copy `contacts.json.sample` to `contacts.json` before executing:
```sh
  grunt simulate
```

To remove the generated contacts:
```sh
  grunt clean-contacts
```


Internally, the 'simulator' task will do:

* Create a soft link from the GAIA apps home to the DIST directory of the application. 
  This means you don't have to copy any files there.
* Build the application and copy all files to DIST directory
* Kill the simulator if it's already running
* Launch the simulator with the correct profile


## Testing with the device

Assuming you have installed Gaia, as described above. You can use the following tasks:

### Install only your application

```sh
  grunt push
```

### Clean all applications and install again (make-gaia)

```sh
  grunt push-clean
```

### Reset the device properties and applications and install

```sh
  grunt push-hard
```


# Design

## CSS/Stylesheets - SASS

We are using sass syntax (the indented one) instead of scss for clarity.

Files are stored in `app/styles`.

We are using compass for its mixins and sprite compilation.

compass (which calls sass) is automatically invoked when running grunt tasks.



## Optional tools

### nvm node version manager

If you need to have multiple versions of node, [nvm](https://github.com/creationix/nvm) 
helps manage them. There are some known incompatibilities between phantomjs and node 0.10.0 
at the time of this writing (2013.03.19).

To make sure everything works, install the 0.10.1 version (you can also use the older 0.8.x versions).

```sh
curl https://raw.github.com/creationix/nvm/master/install.sh | sh
```

Set 0.10.1 as the default node:

```sh
nvm ls
nvm install 0.10.1
nvm use 0.10.1
nvm alias default 0.10.1
          (to set default version)
```
