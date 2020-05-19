#!/bin/bash

set -e

sha=$(git rev-parse HEAD)
echo HEAD $sha

git stash

git checkout -B gh-pages
git reset --hard $sha

npm run build
git add dist/bundle.js -f
git commit -m "GH PAGES BUILD"

git push -u origin gh-pages:gh-pages -f --force-with-lease
git checkout -
git stash pop
