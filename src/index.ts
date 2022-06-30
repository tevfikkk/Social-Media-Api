import http from 'http'

import app from './app'
import { info } from './utils/logger'
import { PORT } from './utils/config'

const server = http.createServer(app)

server.listen(PORT as number | string, () => {
    info(`Server listening on port ${PORT}`)
})