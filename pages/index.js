import Link from 'next/link'
import {useState} from 'react'
import fetch from 'isomorphic-unfetch'

import {HOST, API_HEADERS, UI_PORT} from '../constants'

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
    const c_res = await fetch(`http://${HOST}:${UI_PORT}/api/rooms`,
      { method: 'POST',
        headers: API_HEADERS,
        body: JSON.stringify({name}) })
    const room = await c_res.json()
    const r_res = await fetch(`http://${HOST}:${UI_PORT}/api/rooms`,
      { headers: API_HEADERS })
    const r_rooms = await r_res.json()
    setRooms(r_rooms.rooms)
  }

  return (
    <main>
      <h1>Welcome to DuJo</h1>
      {renderRooms(rooms)}
      <input type='text' value={name} onChange={e => setName(e.target.value)}/>
      <button onClick={createRoom}>Create Room</button>
    </main>
  )
}

Index.getInitialProps = async ({ query }) => query

export default Index
