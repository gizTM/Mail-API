# Mail-API

Rest API for mail content scanning based on NodeJS, Amavisd and Spamassassin

## Installation

### with docker-compose

- v1 (2 services w/ shared volume)

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

- **localhost:1234/spam**
  - mark content as _SPAM_
  - method: POST
- **localhost:1234/ham**
  - mark content as _HAM_
  - method: POST
- **localhost:1234/test**
  - send content to _TEST_ spam score
  - method: PUT
