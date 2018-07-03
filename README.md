# Mail-API

Rest API for mail content scanning based on NodeJS, Amavisd and Spamassassin

## Test run server in docker container

```sh
docker run -it --name <container_name> ubuntu:14.04
```

once in docker container

```sh
rm -vf /var/lib/apt/lists/* && apt-get update && mkdir /data \
apt-get install -y nodejs npm spamassassin curl apt-transport-https ca-certificates \
curl --fail -ssL -o setup-nodejs https://deb.nodesource.com/setup_8.x && bash setup-nodejs && apt-get install -y nodejs build-essential
```

_this will take some time..._

in another terminal

```sh
docker cp /path/to/new_version/folder <container_name>:/data
```

back inside docker container

```sh
cd /data && npm install \
npm run start-dev
```

the code changed by `docker cp <source> <dest>` will be recognized and server will restart automatically

## Run server with docker-compose

- v1 (2 services w/ shared volume and `inotify-tools`)

    ```sh
    cd docker
    ```

- v2 (1 service using `node-cmd` module)

    ```sh
    cd new_version
    ```

- v3 (same as v2 but w/ text/plain request body)

    ```sh
    cd new_version_text
    ```

then

```sh
docker-compose down --rm all --volumes --remove-orphans &&
docker-compose build --no-cache &&
docker-compose up -d --force-recreate --remove-orphans
```

to install **with debug** console remove `-d` option from `docker-compose up` command

### (optional) clear unused docker images and containers

```sh
docker rm $(docker ps -aqf status=exited) &&
docker rmi $(docker images -qf dangling=true)
```

_may take time to install..._

if want to install and run with debug, **remove option -d** from **docker-compose up** command

## Usage

The API consists of 3 function calls

_**port: v1-1234 v2-1235 v3-1236**_

Each with body:

### Header

| Key | Value |
| --- | --- |
| Content-Type | multipart/form-data |

### Body

- form-data

| Request | Key | Value |
| --- | --- | --- |
| `/spam` | spam | _spam_mail_file_ |
| `/ham` | ham | _ham_mail_file_ |
| `/test` | test | _mail_file_ |

### API pattern

- `localhost:1234/spam`
  - mark content as _SPAM_
  - method: POST
- `localhost:1234/ham`
  - mark content as _HAM_
  - method: POST
- `localhost:1234/test`
  - send content to _TEST_ spam score
  - method: PUT

### for v2 only

- `localhost:1235/spams` calls `sa-learn --spam 'folder_name'`
- `localhost:1235/hams` calls `sa-learn --ham 'folder_name'`

where body: `application/json`

```sh
{
  path: <path>
}
```

path can be: `easy_ham_1`, `easy_ham_2`, `easy_ham_3`, `hard_ham_1`, `hard_ham_2`, `spam_1`, `spam_2`, `spam_3`