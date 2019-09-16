import fetch from 'isomorphic-unfetch'

import {SERVER_PORT} from '../config'
import {API_HEADERS} from './constants'

const dujoFetch = (path, options) => {
  const base = process.browser ?
    window.location.origin :
    `http://127.0.0.1:${SERVER_PORT}`

  return fetch(`${base}${path}`, options)
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
