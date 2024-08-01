# iNews Gateway

[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-%23FE5196?logo=conventionalcommits&logoColor=white)](https://conventionalcommits.org)

The iNews Gateway application acts as an adapter for one or more iNews servers, allowing clients to subscribe to changes made to iNews queues.

## Requirements

- Node version 22 or above.

## Manual building

1. Install dependencies with `yarn install`.
2. Build with `yarn build`. Note that the _.env_ file is not copied into the _dist_ folder.
3. Configure _.env_ file. See [Configuration](#configuration). 
4. Run with `yarn start`.

## Start development server

1. Install dependencies with `yarn install`.
2. Configure _.env_ file. See [Configuration](#configuration).
3. Start a development server with `yarn watch`. 

## Configuration

The application can be configured with environment variables and a _.env_ file. The following snippet outlines the available configuration options.

```dotenv
# Connection information for the iNews servers.
# All hosts must share user and password.
INEWS_FTP_HOSTS=localhost,other-host
INEWS_FTP_USER=ftpuser
INEWS_FTP_PASSWORD=very-secure-password

# The port used by the WebSocket server. The default port is 3008.
EVENT_SERVER_PORT=3008

# The number of milliseconds between fetching data from the iNews server(s). The default is 2000.
INEWS_POLLING_INTERVAL_IN_MS=2000
```

## Usage

### Connecting to the WebSocket event server

A WebSocket client connecting to the iNews Gateway for event observation, needs to specify the queues they want to observe in the query parameter.
The queues should be specified as comma-separated list, e.g. `ws://inews-gateway:3008?queues=MY.FIRST.QUEUE,MY.SECOND.QUEUE,MY.THIRD.QUEUE`.
