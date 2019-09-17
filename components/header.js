import Link from 'next/link'

import './header.scss'

export default () => (
  <div className='header'>
    <Link href="/">
      <a>
        <h1>Welcome to DuJo</h1>
      </a>
    </Link>
  </div>
)
