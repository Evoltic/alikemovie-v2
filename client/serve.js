const express = require('express')
const pages = require('./src/pages')

function serve() {
  const app = express()

  app.use(express.static('dist'))

  for (const page of pages) {
    app.get(page.route, (req, res) => {
      res.sendFile(__dirname + `/dist/${page.source}.html`)
    })
  }

  const port = 8000
  app.listen(port, () => console.log(`\n the server is listening on ${port}`))
}

serve()
