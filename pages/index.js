import Link from 'next/link'
import {useState} from 'react'

import Layout from '../components/layout'
import TextSubmit from '../components/textsubmit'
import {getRooms, postRooms} from '../lib/service'

import './index.scss'

const renderRooms = rooms =>
  Object.values(rooms)
    .map(r =>
      <Link key={r.id} href={`/rooms/${r.id}`}>
        <div className='roomitem'>
          <h3>{r.name}</h3>
          <span>{r.videos[0] ? r.videos[0].title : 'EMPTY'}</span>
          <span>👤 {r.subscribers}</span>
        </div>
      </Link>)

const Index = props => {
  let [rooms, setRooms] = useState(props.rooms)

  const createRoom = async (name) => {
    const room = await postRooms(name)
    const r_rooms = await getRooms()
    setRooms(r_rooms.rooms)
  }


  return (
    <Layout>
      <div className='index'>
        <div className='container'>
          <TextSubmit onClick={createRoom}>Create Room</TextSubmit>
          {Object.keys(rooms).length > 0 && (<hr />)}
          {renderRooms(rooms)}
        </div>
			</div>
    </Layout>
  )
}

Index.getInitialProps = async () => {
  return await getRooms()
}

export default Index
