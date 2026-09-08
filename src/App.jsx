import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import MissingForm from './pages/MissingForm'
import MissingList from './pages/MissingList'
import FoundForm from './pages/FoundForm'
import FoundList from './pages/FoundList'
import HelpForm from './pages/HelpForm'
import HelpList from './pages/HelpList'
import Volunteers from './pages/Volunteers'

export default function App() {
  return (
    <div className="app-shell">
      <Header />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/missing" element={<MissingForm />} />
          <Route path="/missing/list" element={<MissingList />} />
          <Route path="/found" element={<FoundForm />} />
          <Route path="/found/list" element={<FoundList />} />
          <Route path="/help" element={<HelpForm />} />
          <Route path="/help/list" element={<HelpList />} />
          <Route path="/volunteers" element={<Volunteers />} />
        </Routes>
      </main>
    </div>
  )
}
