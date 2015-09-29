
all:
	node_modules/mocha-tnv/bin/tnv --config=test/tnv.json

query q:
	node_modules/mocha-tnv/bin/tnv --config=test/tnv.json --query=$(q) --folder=$(f)

