import http from 'http'

import app from './app'
import { PORT } from './utils/config'
import { info } from './utils/logger'

const server = http.createServer(app)

server.listen(PORT as number | string, () => {
  info(`Server listening on port ${PORT}`)
})
