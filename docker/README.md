
# The project contains the **docker folder** and the `Dockerfile`

 The `Dockerfile` is used to Deploy the project to Google Cloud.
  
  The **docker folder** contains a couple of helper scripts:
  
- `docker-compose.yml` (all our services: web, backend, db are described here)
- `start-backend.sh` (starts backend, but only after the database)
- `wait-for-it.sh` (imported from <https://github.com/vishnubob/wait-for-it>)

    > To avoid breaking the application, we recommend you don't edit the following files: everything that includes the **docker folder** and `Dokerfile`.

## Run services

  1. Install docker compose (<https://docs.docker.com/compose/install/>)

  2. Move to `docker` folder. All next steps should ...
