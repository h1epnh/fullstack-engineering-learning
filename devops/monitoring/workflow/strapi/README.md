


# Create database in Postgres
CREATE DATABASE strapi; -- Replace strapi with your DATABASE_NAME
CREATE USER strapi WITH PASSWORD 'strapi'; -- Replace your_password
GRANT ALL PRIVILEGES ON DATABASE strapi TO strapi;


ALTER USER strapi WITH SUPERUSER; -- be careful


# Create customer API
yarn strapi generate