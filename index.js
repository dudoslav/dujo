import express from 'express'
import next from 'next'
import webSocket from 'nodejs-websocket'

import { LOCAL_UI_PORT, LOCAL_WS_PORT, DEV } from './config'
import { c_msg } from './lib/common'
import { MAX_IDLE_TIME } from './lib/constants'

import api from './api'

const app = express()

const napp = next({ dev: DEV })
const nappHandler = napp.getRequestHandler()

let subscribers = []
let rooms = {}

/* WS Code */
webSocket.createServer(socket => {
  socket.on('text', text => {
    const msg = JSON.parse(text)

    switch (msg.type) {
      case 'subscribe': {
        const room_id = msg.data.id
        if (Object.keys(rooms).includes(room_id))
          subscribers.push({socket, room_id})
      } break
    }
  })
  
  socket.on('close', () => {
    subscribers = subscribers.filter(e => e.socket !== socket)
  })
}).listen(LOCAL_WS_PORT)

let f_time = Date.now()
setInterval(() => {
  subscribers.forEach(({socket, room_id}) => {
    if (socket.readyState != socket.OPEN) return
    socket.send(c_msg('sync', rooms[room_id]))
  })

  Object.values(rooms).forEach(room => {
    room.subscribers = subscribers.filter(({ room_id }) => room_id == room.id).length
    const video = room.videos[0]
    const delta = Date.now() - f_time
    if (!video) {
      room.idle += delta
      if (room.idle >= MAX_IDLE_TIME)
        delete rooms[room.id]
      return
    }
    room.idle = 0
    video.current += delta
    if (video.current > video.duration)
      room.videos.shift()
  })
  f_time = Date.now()
}, 500)

/* HTTP Code */
napp.prepare().then(() => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'dudo.cool')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
    next()
  })

  app.use('/api', api(rooms))

  app.get('/rooms/:id', (req, res) => napp.render(req, res, '/rooms',
    { id: req.params.id}))

  app.get('*', nappHandler)
  app.listen(LOCAL_UI_PORT)
})
