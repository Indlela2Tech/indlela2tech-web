import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { MenuIcon, CloseIcon } from './icons'
import { Home, Search, Building2, Bookmark, Info } from 'lucide-react'

export default function NavBar() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  const links = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/browse', label: 'Browse Courses', icon: Search },
    { to: '/institutions', label: 'Institutions', icon: Building2 },
    { to: '/shortlist', label: 'Shortlist', icon: Bookmark },
    { to: '/about', label: 'About', icon: Info },
  ]

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="navbar-brand">
          <img src="/I2T.png" alt="Indlela2Tech" className="navbar-logo" />
        </Link>

        <button
          className="navbar-toggle"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>

        <ul className={`navbar-links ${open ? 'open' : ''}`}>
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <li key={link.to}>
                <Link
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={location.pathname === link.to ? 'active' : ''}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Icon size={18} strokeWidth={2} />
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="pattern-divider" aria-hidden="true"></div>
    </>
  )
}