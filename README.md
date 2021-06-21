# readme

A monorepo for both frontend and backend code.

# The frontend

under development. is not ready yet.

# The backend

## .env

- POSTGRESQL_USER
- POSTGRESQL_HOST
- POSTGRESQL_DATABASE
- POSTGRESQL_PASSWORD
- POSTGRESQL_PORT  
  or
- POSTGRESQL_CONNECTION_STRING
-
- PORT
- IS_NOT_MAIN_INSTANCE
- IS_FIRST_LAUNCH

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




