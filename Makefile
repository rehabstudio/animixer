setup:
	yarn install

run:
	yarn start

deploy:
	yarn build && firebase deploy

setup-functions:
	cd functions && yarn install

deploy-functions:
	cd functions && npm run deploy
