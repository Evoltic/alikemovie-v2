# readme

A monorepo for both frontend and backend code.

# Branches

- ```master``` branch is the main branch, but it is not recommended for
  production use.
- ```v*.*.*``` (e.g. v1.0.0) branch is a snapshot of the master branch,
  they are recommended for production use.
- ```feature/*``` (e.g. feature/docker) branch is a development branch
  with a context. The branch lifecycle: branched from the master -> 
  collects commits -> merged to the master -> deleted.

# Run a production version

``docker compose up``

or

```
cd ./client
npm i
npm start 

cd ..

cd ./server
npm i
npm start

// Reminder: place db credentials to ./server/.env;
//           the db could be setup by docker (./db/.../Dockerfile).
```

# Run a development version

```
cd ./client
npm i
npm run dev 

cd ..

cd ./server
npm i
npm run dev

// Reminder: place db credentials to ./server/.env;
//           the db could be setup by docker (./db/.../Dockerfile).
```

# About .env

## Docker scenario:

### 1. Create ./.env

"THEMOVIEDB_API_KEY" var is required for posters download.

Specify any other variable (in ./.env) supported by
./client/.env and ./server/.env to overwrite defaults if needed.

### 2. Skip ./client/.env

### 3. Skip ./server/.env

## Another scenario:

### 1. Skip ./.env

### 2. (optional) Create ./client/.env 

Optional, because of fallback to ./client/.env.defaults.

#### Available vars:

- WEBSOCKET_API_URL
- CONTENT_API_URL

not supported in ./client/.env file, but available via a shell / docker:
- FRONTEND_PORT

### 3. (required) Create ./server/.env 

#### Available vars

- POSTGRESQL_USER
- POSTGRESQL_HOST
- POSTGRESQL_DATABASE
- POSTGRESQL_PASSWORD
- POSTGRESQL_PORT  
  or
- POSTGRESQL_CONNECTION_STRING (not supported in docker scenario)
-
- WEBSOCKET_SERVER_PORT
- CONTENT_SERVER_PORT
- IS_NOT_MAIN_INSTANCE
- IS_AIM_TO_POPULATE_DATABASE
- THEMOVIEDB_API_KEY
- AVAILABLE_BYTES_FOR_POSTERS
- DNS_SERVER_OPTIONAL

# The frontend

This is a typical Single Page Application, but with prerender.
The type of the content that would be prerendered is the skeleton - the parts
that always static (titles of sections, navbar, footer, placeholders etc).  
There is no Server Side Rendering.

## UI Components

Recommended to getting started with understanding what is the BEM:
https://en.bem.info/methodology/quick-start/

So, the core BEM principle is:  
A block is a combination of elements.
An element can't belong to an element - elements belong to a block.
A block could belong to another block, in this case - the children block
is an element of the parent block and at the same time a block itself.

Let's call a block a component. A component could include only elements, but
also it could consist of other components. A page is also a component, and
typically it's a combination of different components, and those components are
elements of the page.

### Self-sufficiency

Every component is self-sufficiency, meaning it is always ready to be shown,
even if a data for the component is not ready yet. Places for that data
are placeholders. When data is ready - placeholders replaced by that data.

## Threads and states

The app has only two types of states:
- UI state, e.g. ```{ isMenuOpen: false, theme: 'dark' }```
- Any other state, e.g. ```{ movies: ['Avengers', 'Ben 10'], authToken: 'zxc' }```

UI state exists and managed only in the main thread.

Any other state exists and managed in the second thread
(read: off the main thread).
The main thread could listen for the second thread state changes.

The workflow with a worker:  
worker (1) - worker wrapper (2) - middleware (3) - initiator (4)

### 1. Worker (/src/\*\*/*.worker.js)

Methods that should be run inside a worker are defined there.

### 2. Worker wrapper (/src/function/workerWrapper/makeWorker.js)

Each worker is wrapped by the worker wrapper to take off such things from a
.worker.js file:

- creating a new context for every initiator;
- providing a set of available methods of a worker to an initiator;
- managing a worker public state;

Each initiator has an independent worker context. 

### 3. Middleware (/src/function/workerWrapper/useWorker.js)

The middleware is a bridge between a worker (wrapped by the worker wrapper) 
and an initiator. 

The main role of the bridge is just to 
make communication with the worker easier.  
It provides:
- a set of worker methods, defined in a .worker.js file;
- "subscribe to worker state" function;
- "destroy the context" function (if the initiator no longer needs a worker).

### 3. Initiator

An initiator could be a function, component, etc. 
anything that needs to call a worker method.

## Files loading (html, css, js)

Files loading behaviour / splitting / grouping / etc must be handled
by a tool on the app "build" process. The tool is webpack.

### Grouping js/css

A page has two types of files that needed to be downloaded
to show that page: JavaScript and CSS.
HTML is also required, but only on first load, because it's an SPA.

The app consists of shared
across different pages components / functions / styles.
So, the best way could be:

- If some part of code is used only on one page - the part should be included
  in one large "page file".

- If some part of code is used on more than one page - it's a shared piece,
  so it couldn't be added to a "page file"; otherwise, the piece will be
  downloaded x times, where x is a number of pages containing the piece.

- There could be a huge amount of pieces, so a good idea would be to group
  that pieces. If "page 1" uses "piece A" and "piece B" and "page 2" uses
  the same pieces, those pieces could be grouped together. The combination
  of the pieces could be described as "page 1 and page 2 pieces".

*a piece is a .js or .css file. only the same file types could be groped.
so, a page has two "page files": .js and .css.

### Caching

Todo 

# The backend

## Communicating with the server

The chosen tech is WebSocket.

The communication from a client perspective:

1. Sending to the server a name of an action (methodName)
   and a data required to perform the action;
2. Receiving following responses from the server.

To distinguish to which action belongs a response - each request must include
"actionId" field. The server just remembers the "actionId" value and place it
in each response. So, the "actionId" value means nothing to the server, 
it needed only to the client to distinguish responses.

Example: 
```
  socket.send(JSON.stringify({ methodName, actionId, data }))
```
```
  socket.onmessage = event => {
    const { actionId, response } = JSON.parse(event.data)
    const { type, data } = response
    ...
  }
```

## Three types of response data

### Error type:

```

  {
    actionId: 'qqq',
    response: {
      type: 'error',
      data: {
        code: 404,
        name: 'Not Found',
        description: 'The resource "avengers" can not be found'
      }
    }
  }

```

### Raw data type:

Example:
```

  {
    actionId: 'sss',
    response: {
      type: 'raw',
      data: 'some data'
    }
  }

```

### Pieces type

A data is divided in pieces. The reason: getting data partially.  

Example: the client needs some data and makes a request, but the server
has only some part of that data for now,
so the server decides to send first half now,
and the second half when it's ready.

The benefit to the client is that the client could demonstrate
to a user at least something (first half) before the all data is ready.

The first response from the server contains a schema.  
The schema itself is a collection with key / value pairs,
where the key is a name of a field and the value is an id of a piece which will come later.

The later responses are collections with key / value pairs,
where the key is the id of the piece, and the value is either
the final (actual) value or another schema.

So, there are 3 types of pieces:

1. pieces schema (key:piece);
2. pieces itself (piece:value);
3. pieces with a schema (piece:piece);

Example of the first response:
```

  {
    actionId: 'qqq',
    response: {
      type: 'key:piece',
      data: {
        movieName: '123asd',
        thumbnail: '234asd',
        actors: '345asd',
        similarMovies: '456asd'
      }
    }
  }

```

Example of the second response:
```

  {
    actionId: 'qqq',
    response: {
      type: 'piece:value',
      data: {
        '123asd': 'avengers',
        '234asd': 'https://pictures.com/avengers-thumbnail'
      }
    }
  }

```

Example of the third response:
```

  {
    actionId: 'qqq',
    response: {
      type: 'piece:value',
      data: {
        '345asd': ['Vin Diesel', 'Bugs Bunny']
      }
    }
  }

```

Example of the forth response:
```

  {
    actionId: 'qqq',
    response: {
      type: 'piece:piece',
      data: {
        '456asd': ['xzc123', 'zxc234']
      }
    }
  }

```

Example of the fifth (final) response:
```

  {
    actionId: 'qqq',
    response: {
      type: 'piece:value',
      data: {
        'xzc123': 'avengers 2',
        'zxc234': 'avengers 3',
      }
    }
  }

```

## How the backend handles a request

1. Entry - Exit function
2. API handler
3. Services

### 1. Entry - Exit function (/src/api/index.js)

- Making sure that the request is valid;
- Reads a request and decides which API handler is responsible
for answering to that request;
- Providing the API handler with the set of available
options for an answer (sendError, sendData, PiecesSender).
  
### 2. API handler (/src/api/methods/)

The role of the handlers is to handle a client request.
To proceed a request the handler is using a service/services method/methods.

### 3. Services (/src/api/services/)

A service is just a combination of methods which are united by the same
subject.

For example:

- service name: "Accounts";
- description: the service responsible for managing accounts;
- methods: createAccount, updateAccount;




