import express from 'express'
import {Server} from 'http'
import next from 'next'
import webSocket from 'nodejs-websocket'
import youtubeApi from 'better-youtube-api'
import moment from 'moment'

import { LOCAL_UI_PORT, LOCAL_WS_PORT } from './config'
import { r_id, c_msg } from './common'

const youtube = new youtubeApi(process.env.API_KEY)

const app = express()
app.use(express.json())
const server = Server(app)

const dev = process.env.NODE_ENV !== 'production'
const napp = next({ dev })
const nappHandler = napp.getRequestHandler()

let subscribers = []
let rooms = {}

const parse_id = url => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match&&match[7].length==11)? match[7] : false;
}

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
    subscribers.filter(e => e.socket !== socket)
  })
}).listen(LOCAL_WS_PORT)

let f_time = Date.now()
setInterval(() => {
  subscribers.forEach(({socket, room_id}) => {
    if (socket.readyState != socket.OPEN) return
    socket.send(c_msg('sync', rooms[room_id]))
  })

  Object.values(rooms).forEach(room => {
    const video = room.videos[0]
    if (!video) return
    video.current += Date.now() - f_time
    if (video.current > video.duration)
      room.videos.shift()
  })
  f_time = Date.now()
}, 500)

/* HTTP Code */
napp.prepare().then(() => {
  app.get('/api/rooms', (_, res) => res.json({rooms}))

  app.post('/api/rooms', (req, res) => {
    const { name } = req.body
    const id = r_id()

    rooms[id] = { id, name, videos: [] }
    res.json({ id })
  })

  app.post('/api/rooms/:id/videos', async (req, res) => {
    const { video } = req.body
    const video_id = parse_id(video)

    if (!video_id) {
      res.json({ status: 'unknown' })
      return
    }

    const video_detail = await youtube.getVideo(video_id)
    const duration = moment.duration(video_detail.data.contentDetails.duration)
      .asMilliseconds()
    const title = video_detail.data.snippet.title

    rooms[req.params.id].videos.push({ id: r_id(), current: 0, duration, title, video_id })

    res.json({ status: 'ok' })
  })

  app.get('/', (req, res) => napp.render(req, res, '/index', { rooms }))
  app.get('/index', (req, res) => napp.render(req, res, '/index', { rooms }))

  app.get('/rooms/:id', (req, res) => {
    const room = rooms[req.params.id]
    // TODO: not found
    napp.render(req, res, '/rooms', { room })
  })

  app.get('*', nappHandler)
  server.listen(LOCAL_UI_PORT)
})
