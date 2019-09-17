import {useState} from 'react'
import YouTube from 'react-youtube'

import {MAX_DELTA} from '../lib/constants'

export default props => {
  const { video, time } = props
  let [player, setPlayer] = useState()
  let [last, setLast] = useState('')

  const handleChange = () => {
    if (!player) return

    if (!video) {
      if (last) player.stopVideo()
    } else {
      if (video != last) {
        player.loadVideoById(video, time / 1000)
        setLast(video)
      } else {
        const curr = Math.floor(player.getCurrentTime() * 1000)
        if (Math.abs(curr - time) > MAX_DELTA)
          player.seekTo(time / 1000, true)
      }
    }
  }

  const onReady = ({target}) => {
    setPlayer(target)
    handleChange()
  }

  handleChange()
  return (
    <YouTube opts={{width: '100%'}} onReady={onReady}/>
  )
}
