# Build FE
yarn cache clean
rm -rf node_modules
yarn install

# Setup
make build
make compose_build 
make create_database
make up


# Reference
https://github.com/getredash/redash/wiki/Local-development-setup


Add to package.json
"resolutions": {
    "puppeteer": "https://github.com/seanaye/puppeteer/releases/download/v5.5.0-apple-silicon/puppeteer-core-5.5.0-post.tgz"
}