import {useState} from 'react'
import './textsubmit.scss'

export default props => {
  let [value, setValue] = useState('')

  return (
    <div className='textsubmit'>
      <input
      className='block'
      type='text'
      value={value}
      onChange={e => setValue(e.target.value)}
      />
      <button className='block' onClick={() => props.onClick(value)}>{props.children}</button>
    </div>
  )
}
