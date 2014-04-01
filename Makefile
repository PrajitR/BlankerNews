test:
	@./node_modules/.bin/mocha --timeout 5000 --reporter list

.PHONY: test
