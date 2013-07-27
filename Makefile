TESTS = test/*.js
REPORTER = spec
#REPORTER = dot

check: test

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		--timeout 300 \
		--require should \
		--growl \
		$(TESTS)

browserify:
	browserify src/index.js > build/client.js

uglify: browserify
	uglifyjs build/client.js > build/client.min.js

build: uglify

install:
	npm install

.PHONY: test