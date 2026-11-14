
import { useState } from 'react'
import './App.css'

const services = [
  {
    name: 'One-on-One Tech Support',
    description: 'Get personal help with your phone, tablet, computer, or other devices.',
    icon: '💻',
  },
  {
    name: 'Technology Classes',
    description: 'Learn new skills in friendly, easy-to-follow group sessions.',
    icon: '📱',
  },
  {
    name: 'Device Setup & Troubleshooting',
    description: 'Get help setting up devices, fixing problems, and staying connected.',
    icon: '⚙️',
  },
]

function App() {
  const [page, setPage] = useState('home')

  return (
    <div className="app">
      <header className="header">
        <h2 className="logo">TechConnect<span>+</span></h2>
        <nav>
          <button onClick={() => setPage('home')}>Home</button>
          <button onClick={() => setPage('services')}>Services</button>
          <button onClick={() => setPage('booking')}>Book Support</button>
        </nav>
      </header>

      {page === 'home' && (
        <main>
          <section className="hero">
            <span className="eyebrow">TECHNOLOGY MADE SIMPLE</span>
            <h1>Connecting People.<br />Empowering Lives.</h1>
            <p>
              Friendly technology support and education designed
              for residents of senior living communities.
            </p>
            <button className="primary" onClick={() => setPage('booking')}>
              Book Tech Support
            </button>
            <button className="secondary" onClick={() => setPage('services')}>
              Explore Services
            </button>
          </section>

          <section className="content">
            <h2>How Can We Help?</h2>
            <div className="services">
              {services.map((service) => (
                <article className="service-card" key={service.name}>
                  <div className="service-icon">{service.icon}</div>
                  <h3>{service.name}</h3>
                  <p>{service.description}</p>
                </article>
              ))}
            </div>
          </section>
        </main>
      )}

      {page === 'services' && (
        <main className="content">
          <h1>Our Services</h1>
          <p>Choose the technology support that works for you.</p>
          <div className="services">
            {services.map((service) => (
              <article className="service-card" key={service.name}>
                <div className="service-icon">{service.icon}</div>
                <h3>{service.name}</h3>
                <p>{service.description}</p>
                <button className="primary" onClick={() => setPage('booking')}>
                  Book Now
                </button>
              </article>
            ))}
          </div>
        </main>
      )}

      {page === 'booking' && (
        <main className="content">
          <h1>Book Tech Support</h1>
          <p>Tell us how we can help you.</p>
          <form className="booking-form" onSubmit={(event) => {
            event.preventDefault()
            alert('Your booking request has been received!')
          }}>
            <label>
              Full Name
              <input type="text" required placeholder="Enter your name" />
            </label>
            <label>
              Email Address
              <input type="email" required placeholder="Enter your email" />
            </label>
            <label>
              Select a Service
              <select required defaultValue="">
                <option value="" disabled>Choose a service</option>
                {services.map((service) => (
                  <option key={service.name} value={service.name}>
                    {service.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Preferred Date
              <input type="date" required />
            </label>
            <label>
              Describe Your Issue
              <textarea placeholder="What do you need help with?" rows="4" />
            </label>
            <button className="primary" type="submit">Submit Booking</button>
          </form>
        </main>
      )}

      <footer>© 2026 TechConnect. Technology made approachable.</footer>
    </div>
  )
}

export default App