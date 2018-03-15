include .env
export

setup:
	yarn install

run:
	yarn start

deploy:
	yarn build && firebase deploy

setup-functions:
	cd functions && yarn install

run-functions:
	ENV=DEV && cd functions && npm run serve

deploy-functions:
	cd functions && npm run deploy
