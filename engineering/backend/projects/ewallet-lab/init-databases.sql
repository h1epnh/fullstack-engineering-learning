-- Creates one database per service on the single Postgres instance used by docker-compose.
-- Each service still only ever connects to its own database (schema-per-service) — this is purely
-- a docker-compose convenience so we don't need 3 separate Postgres containers for a lab this size.
CREATE DATABASE ewallet_user;
CREATE DATABASE ewallet_wallet;
CREATE DATABASE ewallet_topup;
CREATE DATABASE ewallet_bill_payment;
CREATE DATABASE ewallet_payment_request;
CREATE DATABASE ewallet_lucky_money;
