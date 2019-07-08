#!/bin/sh
NYC_PATH=".nyc_output"

rm -r "./$NYC_PATH"
rm .coverage/coverage.json

# Coverage for elements
for d in elements/*; do
	if [ -d $d ] && [ -d $d/.nyc_output ]; then
		cp -a $d/.nyc_output ./
	fi
done

# Coverage for framework
cp -r ./framework/test/mocha/.coverage-unit/* ./.nyc_output
cp ./.coverage/unit/coverage-final.json ./.nyc_output/coverage-framework-unit.json

# Coverage for commander
cp -r ./commander/.nyc_output/* ./.nyc_output

npx nyc merge ./.nyc_output .coverage/coverage.json
npx nyc report --report-dir .coverage --reporter=clover --reporter=text
