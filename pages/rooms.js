import {useState, useEffect} from 'react'
import Router from 'next/router'
import WebSocket from 'isomorphic-ws'
import YouTube from 'react-youtube'

import Layout from '../components/layout'
import {addVideo, getRoom} from '../lib/service'
import {c_msg} from '../lib/common'
import {MAX_DELTA} from '../lib/constants'
import {HOST, REMOTE_WS_PORT} from '../config'

const renderVideos = videos =>
  videos.map(v =>
    <div key={v.id}>
      {v.title}
    </div>)

const Room = props => {
  let socket
  let [local, setLocal] = useState(props.room)
  let [room, setRoom] = useState(props.room)
  let [input, setInput] = useState('')
  let [player, setPlayer] = useState()

  useEffect(() => {
    socket = new WebSocket(`ws://${HOST}:${REMOTE_WS_PORT}`)
    socket.onopen = () => {
      socket.send(c_msg('subscribe', { id: room.id }))
      socket.onmessage = e => {
        const msg = JSON.parse(e.data)
        if (msg.type == 'sync') {
          if (!msg.data) {
            socket.close()
            Router.push('/')
            return
          }
          setRoom(msg.data)
        }
      }
    }
  }, [])

  useEffect(() => {
    const l_video = local.videos[0]
    const r_video = room.videos[0]

    if (!l_video && r_video) {
      setLocal(room)
      player.loadVideoById(r_video.video_id, r_video.current / 1000)
    }

    if (l_video && !r_video) {
      setLocal(room)
      player.stopVideo()
    }

    if (l_video && r_video) {
      if (l_video.video_id == r_video.video_id) {
        if (player) {
          const curr = Math.floor(player.getCurrentTime() * 1000)
          const remote = room.videos[0].current
          if (Math.abs(curr - remote) > MAX_DELTA)
            player.seekTo(remote / 1000, true)
        }
      } else {
        setLocal(room)
        player.loadVideoById(r_video.video_id, r_video.current / 1000)
      }
    }
  }, [room])

  const onAddVideoClick = () => {
    addVideo(room.id, input)
    setInput('')
  }

  const onReady = e => {
    setPlayer(e.target)
    if (!local.videos[0]) return
    e.target.loadVideoById(local.videos[0].video_id, local.videos[0].current / 1000)
  }

  return (
    <Layout>
      <h2>{room.name}</h2>
      <input type='text' value={input} onChange={e => setInput(e.target.value)}/>
      <button onClick={onAddVideoClick}>Add Video</button>
      <YouTube opts={{width: '640', height: '390'}} onReady={onReady}/>
      {renderVideos(room.videos)}
    </Layout>
  )
}

Room.getInitialProps = async ({query, res}) => {
  const { id } = query
  const room = await getRoom(id)
  if (room.error) res.redirect('/')
  return room
}

export default Room
