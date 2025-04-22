# `database-files` Folder
## Contents

- **strava_app.sql**: A single SQL script that:
  - Creates the `strava_app` database if it does not exist.
  - Defines all tables, relationships, and constraints required by the application.
  - Inserts sample data for development and testing.

## Usage

> **Prerequisites**: Docker (with Docker Compose) or a local MySQL installation.

> **Database credentials** are configured in `api/.env`:
> ```env
> DB_USER=root
> DB_HOST=db
> DB_PORT=3306
> DB_NAME=strava_app
> MYSQL_ROOT_PASSWORD=<your_root_password>
> ```
>
> Modify as needed for your environment.

## Notes

- Running `strava_app.sql` multiple times against an existing database will not overwrite tables because of the `IF NOT EXISTS` clauses.