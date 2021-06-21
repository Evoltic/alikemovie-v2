const { Pool } = require('pg')

// about Client and Pool:
// Connecting a new client to the PostgreSQL server requires a handshake
// which can take 20-30 milliseconds.
// The PostgreSQL server can only handle a limited number of clients at a time.
// PostgreSQL can only process one query at a time on a single connected client.
// The client pool allows to have a reusable pool of clients.

class PostgreSql {
  constructor(credentials, initialQuery) {
    this.pool = new Pool({ ...credentials })

    if (initialQuery) this.query(initialQuery[0], initialQuery[1])
  }

  end() {
    return this.pool.end()
  }

  query(text, values, client) {
    // avoid string concatenating parameters into the query text.
    // instead, pass a query text unaltered, example:
    // text: 'INSERT INTO users(name, email) VALUES($1, $2) RETURNING *'
    // values: ['brian', 'brian@gmail.com']

    if (client) return client.query(text, values)
    return this.pool.query(text, values)
  }

  async getClient() {
    const client = await this.pool.connect()
    // do not forget to release a client after usage
    return {
      query: (text, values) => this.query(text, values, client),
      release: client.release
    }
  }
}

module.exports = { PostgreSql }
