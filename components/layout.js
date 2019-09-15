import Header from './header'

export default props => (
  <div>
    <Header />
    <main>
      {props.children}
    </main>
  </div>
)
