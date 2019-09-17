import Header from './header'

import '../style.scss'
import './layout.scss'

export default props => (
  <div>
    <Header />
    <main>
      {props.children}
    </main>
  </div>
)
