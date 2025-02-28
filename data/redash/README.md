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