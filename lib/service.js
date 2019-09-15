import fetch from 'isomorphic-unfetch'

import {REMOTE_UI_PORT, LOCAL_UI_PORT, HOST, REMOTE_PROTO, LOCAL_PROTO} from '../config'
import {API_HEADERS} from './constants'

const dujoFetch = (path, options) => {
  const base = process.browser ?
    `${HOST}:${REMOTE_UI_PORT}` :
    `127.0.0.1:${LOCAL_UI_PORT}`

  const proto = process.browser ? REMOTE_PROTO : LOCAL_PROTO

  return fetch(`${proto}://${base}${path}`, options)
}

export const getRooms = async () => {
  const res = await dujoFetch('/api/rooms', { headers: API_HEADERS })
  return await res.json()
}

export const postRooms = async name => {
  const res = await dujoFetch('/api/rooms',
      { method: 'POST',
        headers: API_HEADERS,
        body: JSON.stringify({ name }) })
  return await res.json()
}

export const getRoom = async room_id => {
  const res = await dujoFetch(`/api/rooms/${room_id}`, { headers: API_HEADERS })
  return await res.json()
}

export const addVideo = async (room_id, video) => {
  const res = await dujoFetch(`/api/rooms/${room_id}/videos`,
      { headers: API_HEADERS,
        method: 'POST',
        body: JSON.stringify({ video })})
  return await res.json()
}
