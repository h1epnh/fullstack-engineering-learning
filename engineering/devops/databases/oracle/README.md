# Oracle Database Docker Setup

This directory contains Docker Compose configuration for running Oracle Database Express Edition (XE) 21c.

## Prerequisites

1. **Docker and Docker Compose** installed on your system
2. **Oracle Container Registry Account** (free):
   - Go to https://container-registry.oracle.com/
   - Sign in or create an account
   - Search for "database/express"
   - Accept the license agreement

3. **Docker Login** to Oracle Container Registry:
   ```bash
   docker login container-registry.oracle.com
   # Enter your Oracle account credentials
   ```

## Quick Start

1. **Start the Oracle Database**:
   ```bash
   docker-compose up -d
   ```

2. **Check the logs** (first startup takes 5-10 minutes):
   ```bash
   docker-compose logs -f oracle-db
   ```
   Wait for the message: `DATABASE IS READY TO USE!`

3. **Connect to the database**:
   - **Host**: localhost
   - **Port**: 1521
   - **Service Name**: XE
   - **SID**: XE
   - **Username**: system (or sys as sysdba)
   - **Password**: OraclePassword123

## Connection Examples

### Using SQL*Plus (from container)
```bash
docker exec -it oracle-xe-21c sqlplus system/OraclePassword123@XE
```

### Using SQL*Plus as SYSDBA
```bash
docker exec -it oracle-xe-21c sqlplus sys/OraclePassword123@XE as sysdba
```

### Connection String
```
jdbc:oracle:thin:@localhost:1521:XE
```

### Oracle Enterprise Manager (EM) Express
Access the web-based management console:
```
https://localhost:5500/em
```

## Configuration

### Environment Variables

You can customize the following in `docker-compose.yml`:

- `ORACLE_PWD`: Password for SYS, SYSTEM, and PDBADMIN users (default: OraclePassword123)
- `ORACLE_CHARACTERSET`: Database character set (default: AL32UTF8)

### Ports

- **1521**: Oracle listener port (TNS)
- **5500**: Oracle Enterprise Manager Express

### Volumes

- `oracle-data`: Persistent storage for database files
- `./init-scripts`: Optional directory for initialization SQL scripts

## Initialization Scripts

To run custom SQL scripts on database startup:

1. Create the `init-scripts` directory:
   ```bash
   mkdir -p init-scripts
   ```

2. Add your `.sql` or `.sh` scripts to this directory

3. Scripts will be executed automatically on first startup

Example initialization script (`init-scripts/01-create-user.sql`):
```sql
-- Create a new user
CREATE USER myuser IDENTIFIED BY mypassword;
GRANT CONNECT, RESOURCE TO myuser;
GRANT UNLIMITED TABLESPACE TO myuser;
```

## Useful Commands

### Stop the database
```bash
docker-compose down
```

### Stop and remove volumes (⚠️ deletes all data)
```bash
docker-compose down -v
```

### View container status
```bash
docker-compose ps
```

### Execute SQL commands
```bash
docker exec -it oracle-xe-21c sqlplus system/OraclePassword123@XE <<EOF
SELECT * FROM v\$version;
EXIT;
EOF
```

### Backup the database
```bash
docker exec oracle-xe-21c sh -c 'expdp system/OraclePassword123@XE full=y directory=DATA_PUMP_DIR dumpfile=backup.dmp'
```

## Troubleshooting

### Container won't start
- Check if ports 1521 or 5500 are already in use
- Ensure you have enough disk space (minimum 10GB recommended)
- Check memory allocation (minimum 1GB, recommended 2GB)

### Can't connect to database
- Wait for the database to fully initialize (check logs)
- Verify the password matches `ORACLE_PWD` in docker-compose.yml
- Ensure firewall isn't blocking ports 1521 or 5500

### Reset everything
```bash
docker-compose down -v
docker-compose up -d
```

## Resource Requirements

- **Minimum RAM**: 1GB
- **Recommended RAM**: 2GB or more
- **Disk Space**: 10GB minimum
- **CPU**: 2 cores recommended

## Security Notes

⚠️ **Important**: Change the default password in production!

1. Update `ORACLE_PWD` in `docker-compose.yml`
2. Or change it after startup:
   ```sql
   ALTER USER system IDENTIFIED BY new_password;
   ALTER USER sys IDENTIFIED BY new_password;
   ```

## Additional Resources

- [Oracle Database Express Edition Documentation](https://docs.oracle.com/en/database/oracle/oracle-database/21/xeinl/)
- [Oracle Container Registry](https://container-registry.oracle.com/)
- [Oracle SQL Developer](https://www.oracle.com/database/sqldeveloper/) - Free GUI tool

## License

Oracle Database Express Edition is free to use for development and deployment. See Oracle's license terms for details.
