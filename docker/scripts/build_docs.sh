#!/usr/bin/env bash

source './docker/scripts/common_container_utils.sh'

set -x
if is_env_develop ; then
  branch="`git branch | grep \* | cut -d ' ' -f2`"
  echo "currently on '$branch'"
  # removing remote branch
  git config user.name "Victor Fernandez"
  git config user.email "victor.j.fdez@gmail.com"
  # remove old orphan gh-page
  git push origin --delete gh-pages
  git branch -D gh-pages
  # create new branch
  git checkout --orphan "gh-pages"
  # if environment is develop/development then htmls docs for this
  # project
  docker run -v `pwd`/docs/:/usr/src/app/docs/ `gen_image_name` run prod:docs 
  mv docs/* ./
  rm -rf docs/
  rm -rf `find . -maxdepth 1 | grep -v 'index.html\|assets\|\.git\|\.$'`
  # deploy to github pages
  git add ./
  git status
  git commit -m "documentation for `package_version`"
  git push origin gh-pages
  # return to original branch
  git checkout "$branch"
  git reset --hard
fi
set +x
