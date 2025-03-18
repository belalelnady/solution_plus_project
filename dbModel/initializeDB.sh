#!/bin/bash

echo "MySQL is up - Executing scripts..."
mysql -u root -p$MYSQL_ROOT_PASSWORD $MYSQL_DATABASE < /bootstrap/dbModel/schema.sql

mysql -u root -p$MYSQL_ROOT_PASSWORD $MYSQL_DATABASE < /bootstrap/dbModel/initialize.sql

echo "Database initialized successfully."
