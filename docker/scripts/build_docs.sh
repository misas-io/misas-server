#!/usr/bin/env bash

source './docker/scripts/common_container_utils.sh'

set -x
if is_env_develop ; then
  branch="`git branch | grep \* | cut -d ' ' -f2`"
  echo "currently on '$branch'"
  git config user.name "Victor Fernandez"
  git config user.email "victor.j.fdez@gmail.com"
  git checkout --orphan -B "gh-pages"
  # if environment is develop/development then htmls docs for this
  # project
  docker run -v `pwd`:/usr/src/app `gen_image_name` run prod:docs 
  rm -rf `find . -depth 1 | grep -v 'index.html\|assets\|.git$'`
  # deploy to github pages
  git status
  git add ./assets/ ./index.html
  git commit -m "documentation for `package_version`"
  git push origin gh-pages
  # return to original branch
  git checkout "$branch"
  git reset --hard
fi
set +x
