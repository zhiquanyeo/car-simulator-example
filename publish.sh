#!/bin/bash

NODE="node.exe"
NPM='C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js'

set -e

sha=$(git rev-parse HEAD)
echo HEAD $sha

git stash

git checkout -B gh-pages
git reset --hard $sha

$NODE "$NPM" run build
git add dist/bundle.js -f
git commit -m "GH PAGES BUILD"

git push -u origin gh-pages:gh-pages -f --force-with-lease
git checkout -
git stash pop
