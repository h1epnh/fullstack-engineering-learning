Connecting and General Commands
	•	`psql -U <user>`: Connect to PostgreSQL as user.
	•	`\q`: Quit psql shell.
	•	`\c <database>`: Connect to a database.
	•	`\l`: List all databases.
	•	`\dn`: List schemas.
	•	`\dt`: List tables in current schema.
	•	`\dt *.*`: List tables in all schemas.
	•	`\d <table>`: Show table structure.
	•	`\d+ <table>`: Show detailed table info.
Data Query & Manipulation
	•	`SELECT * FROM <table>;`: Select all rows.
	•	`SELECT * FROM <table> WHERE <condition>;`: Query with condition.
	•	`INSERT INTO <table> (columns) VALUES (values);`: Insert data.
	•	`UPDATE <table> SET column=value WHERE condition;`: Update data.
	•	`DELETE FROM <table> WHERE condition;`: Delete data.
Table & Schema Management
	•	`CREATE TABLE <table> (columns);`: Create table.
	•	`ALTER TABLE <table> ADD COLUMN <column> <type>;`: Add column.
	•	`DROP TABLE <table>;`: Drop table.
	•	`CREATE SCHEMA <name>;`: Create a schema.
	•	`DROP SCHEMA <name> CASCADE;`: Drop schema with all objects.
Roles and Permissions
	•	`CREATE ROLE <name> LOGIN PASSWORD '<pwd>';`: Create role/user.
	•	`ALTER ROLE <name> PASSWORD '<pwd>';`: Change password.
	•	`DROP ROLE <name>;`: Drop role.
	•	`GRANT SELECT, INSERT ON <table> TO <role>;`: Grant permissions.
Maintenance & Monitoring
	•	`VACUUM;`: Reclaim storage and optimize.
	•	`ANALYZE;`: Update statistics for the query planner.
	•	`EXPLAIN <query>;`: Show query execution plan.
	•	`EXPLAIN ANALYZE <query>;`: Show actual query plan and timing.
	•	`SELECT * FROM pg_stat_activity;`: Monitor active queries.
	•	`SELECT pg_size_pretty(pg_database_size('<database>'));`: Check DB size.
Import/Export Data
	•	`COPY <table> FROM '<file>' CSV HEADER;`: Import CSV.
	•	`COPY <table> TO '<file>' CSV HEADER;`: Export CSV.
Helpful Utilities
	•	`\x`: Toggle expanded query output format.
	•	`\du`: List users/roles.
	•	`\df`: List functions.
	•	`\dx`: List installed extensions.