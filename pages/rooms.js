import {useState, useEffect} from 'react'
import Router from 'next/router'
import Link from 'next/link'
import WebSocket from 'isomorphic-ws'

import Layout from '../components/layout'
import SyncPlayer from '../components/syncplayer'
import TextSubmit from '../components/textsubmit'
import {addVideo, getRoom} from '../lib/service'
import {c_msg} from '../lib/common'
import {WS_PROTO} from '../config'

import './rooms.scss'

const renderVideos = videos =>
  videos.map(v =>
    <div className='video' key={v.id}>
      <Link href={`https://www.youtube.com/watch?v=${v.video_id}`}>
        <a>{v.title}</a>
      </Link>
    </div>)

const Room = props => {
  let [socket, setSocket] = useState()
  let [room, setRoom] = useState(props.room)

  useEffect(() => {
    let s = new WebSocket(`${WS_PROTO}://${window.location.host}`)
    s.onopen = () => {
      s.send(c_msg('subscribe', { id: room.id }))
      s.onmessage = e => {
        const msg = JSON.parse(e.data)
        if (msg.type == 'sync') {
          if (!msg.data) {
            s.close()
            Router.push('/')
            return
          }
          setRoom(msg.data)
        }
      }
    }
    setSocket(s)
  }, [])

  const onAddVideoClick = url => addVideo(room.id, url)

  return (
    <Layout>
      <div className='rooms'>
        <h2>{room.name}</h2>
        <div className='container'>
          <div className='player'>
            <SyncPlayer
              time={room.videos[0] ? room.videos[0].current : undefined}
              video={room.videos[0] ? room.videos[0].video_id : undefined}
            />
          </div>
          <div className='videos'>
            <TextSubmit onClick={onAddVideoClick}>Add Video</TextSubmit>
            {renderVideos(room.videos)}
          </div>
        </div>
        <h4>Watching: {room.subscribers}</h4>
      </div>
    </Layout>
  )
}

Room.getInitialProps = async ({query, res}) => {
  const { id } = query
  const room = await getRoom(id)
  if (room.error) {
      res.redirect('/')
      return
  }
  return room
}

export default Room
