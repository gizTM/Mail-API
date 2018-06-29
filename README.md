# Mail-API

Rest API for mail content scanning based on NodeJS, Amavisd and Spamassassin

## Installation

install with docker-compose

```sh
cd docker
docker-compose down --rm all --volumes --remove-orphans &&
docker-compose build --no-cache &&
docker-compose up -d --force-recreate --remove-orphans
```

_may take time to install..._

if want to install and run with debug, **remove option -d** from **docker-compose up** command

## Usage

The API consists of 3 function calls
Each with body:

```sh
{
  content: [mail content as text]
}
```

- **localhost:1234/spam**
  - mark content as _SPAM_
  - method: POST
- **localhost:1234/ham**
  - mark content as _HAM_
  - method: POST
- **localhost:1234/test**
  - send content to _TEST_ spam score
  - method: PUT
