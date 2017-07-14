#!/usr/bin/env bash 

LOCAL_DEPLOY_DIR=~/Sites/tintuna.com/projects/sudokureact
echo npm run build
npm run build

if [ -d $LOCAL_DEPLOY_DIR ]; then
	rm -r $LOCAL_DEPLOY_DIR
fi

echo cp build -r $LOCAL_DEPLOY_DIR
cp -r build $LOCAL_DEPLOY_DIR
