#!/usr/bin/env bash

source './docker/scripts/common_container_utils.sh'

set -x
if is_env_develop ; then
  git config user.name "Victor Fernandez"
  git config user.email "victor.j.fdez@gmail.com"
  git checkout -B "gh-pages"
  # if environment is develop/development then htmls docs for this
  # project
  docker run -v `pwd`:/usr/src/app `gen_image_name` run prod:docs 
  # deploy to github pages
  git status
  git add ./assets/ ./index.html
  git commit -m "documentation for `package_version`"
  git push origin gh-pages
fi
set +x
