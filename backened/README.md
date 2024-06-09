# CRM - template backend

Run App on local machine

 Install local dependencies

- `yarn install`

---

 Adjust local db

 1. Install postgres

- MacOS:

  - `brew install postgres`

- Ubuntu:
  - `sudo apt update`
  - `sudo apt install postgresql postgresql-contrib`

   Create db and admin user

- Before run and test connection, make sure you have created a database as described in the above configuration. You can use the `psql` command to create a user and database.

  - `psql postgres --u postgres`

- Next, type this command for creating a new user with password then give access for creating the database
