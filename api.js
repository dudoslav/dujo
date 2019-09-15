import express from 'express'
import youtubeApi from 'better-youtube-api'
import moment from 'moment'

import { r_id } from './lib/common'

const youtube = new youtubeApi(process.env.API_KEY)
const api = express()

let rooms = {}

api.use(express.json())

api.get('/rooms', (_, res) => {
  res.json({ rooms })
})

api.post('/rooms', (req, res) => {
  const { name } = req.body
  const id = r_id()

  rooms[id] = { id, name, videos: [], idle: 0, subscribers: 0 }
  res.json({ id })
})

const parse_id = url => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length == 11) ? match[7] : false;
}

api.get('/rooms/:id', (req, res) => {
  const room = rooms[req.params.id]
  if (!room) res.json({ error: 'room not found' })
  else res.json({ room })
})

api.post('/rooms/:id/videos', async (req, res) => {
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

export default (r) => {
  rooms = r
  return api
}
