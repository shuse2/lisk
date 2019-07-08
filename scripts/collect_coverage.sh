#!/bin/sh
NYC_PATH=".nyc_output"

rm -r "./$NYC_PATH/*"

# Coverage for elements
for d in elements/*; do
	if [ -d $d ] && [ -d $d/.nyc_output ]; then
		cp -av $d/.nyc_output ./
	fi
done

# Coverage for framework
cp -vr ./framework/test/mocha/.coverage-unit/* ./.nyc_output
cp -v ./.coverage/unit/coverage-final.json ./.nyc_output/coverage-framework-unit.json

# Coverage for commander
cp -vr ./commander/.nyc_output/* ./.nyc_output

npx nyc merge ./.nyc_output .coverage/coverage.json
