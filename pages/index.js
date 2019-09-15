import Link from 'next/link'
import {useState} from 'react'

import Layout from '../components/layout'
import {getRooms, postRooms} from '../lib/service'

const renderRooms = rooms =>
  Object.values(rooms)
    .map(r =>
      <div key={r.id}>
        <Link href={`/rooms/${r.id}`}>
          <a>{r.name}</a>
        </Link>
      </div>)

const Index = props => {
  let [name, setName] = useState('')
  let [rooms, setRooms] = useState(props.rooms)

  const createRoom = async () => {
    const room = await postRooms(name)
    const r_rooms = await getRooms()
    setRooms(r_rooms.rooms)
  }

  return (
    <Layout>
      <h1>Welcome to DuJo</h1>
      {renderRooms(rooms)}
      <input type='text' value={name} onChange={e => setName(e.target.value)}/>
      <button onClick={createRoom}>Create Room</button>
    </Layout>
  )
}

Index.getInitialProps = async () => {
  return await getRooms()
}

export default Index
