import { useState } from 'react'
import { validateBooking } from './booking.js'
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

const providers = [
  {
    id: 'provider-001',
    name: 'Tech Support Specialist 1',
  },
  {
    id: 'provider-002',
    name: 'Tech Support Specialist 2',
  },
]
const initialAvailability = [
  {
    providerId: 'provider-001',
    date: '2026-12-01',
    startTime: '09:00',
    endTime: '12:00',
  },
  {
    providerId: 'provider-002',
    date: '2026-12-01',
    startTime: '09:00',
    endTime: '12:00',
  },
]

function App() {
  const [page, setPage] = useState('home')
  const [reschedulingId, setReschedulingId] = useState(null)
  const [availability, setAvailability] = useState(() => {
    try {
      const saved = localStorage.getItem('techconnectAvailability')
      return saved ? JSON.parse(saved) : initialAvailability
    } catch {
      return initialAvailability
    }
  })
  const [appointments, setAppointments] = useState(() => {
  try {
    return JSON.parse(localStorage.getItem('techconnectAppointments') || '[]')
  } catch {
    return []
  }
})

function handleBooking(event) {
  event.preventDefault()

  const formData = new FormData(event.currentTarget)

  const selectedService = services.find(
    (service) => service.name === formData.get('service')
  )

  const booking = {
    serviceId: selectedService?.name || '',
    providerId: formData.get('providerId'),
    date: formData.get('date'),
    time: formData.get('time'),
  }
  
  const duplicateRequest = appointments.some((appointment) =>
    appointment.providerId === booking.providerId &&
    appointment.date === booking.date &&
    appointment.time === booking.time &&
    ['requested', 'confirmed'].includes(
      String(appointment.status).toLowerCase()
    )
  )

  if (duplicateRequest) {
    alert(
      'A request already exists for this provider and time. Please choose another appointment.'
    )
    return
  }

  const schedulingCheck = validateBooking(
    booking,
    availability,
    appointments,
    {
      id: 'demo-resident',
      role: 'resident',
    }
  )

  if (!schedulingCheck.valid) {
    alert(schedulingCheck.error)
    return
  }

  const newAppointment = {
    id: crypto.randomUUID(),
    name: formData.get('name'),
    email: formData.get('email'),
    service: formData.get('service'),
    providerId: formData.get('providerId'),
    date: formData.get('date'),
    time: formData.get('time'),
    issue: formData.get('issue'),
    status: 'Requested',
  }


  const updatedAppointments = [...appointments, newAppointment]

  setAppointments(updatedAppointments)
  localStorage.setItem(
    'techconnectAppointments',
    JSON.stringify(updatedAppointments)
  )

  alert('Your appointment request has been saved!')
  event.currentTarget.reset()
}

function handleCancelRequest(appointmentId) {
  const confirmed = window.confirm(
    'Are you sure you want to cancel this appointment request?'
  )

  if (!confirmed) {
    return
  }

  const updatedAppointments = appointments.map((appointment) => {
    if (
      appointment.id === appointmentId &&
      String(appointment.status).toLowerCase() === 'requested'
    ) {
      return {
        ...appointment,
        status: 'Canceled',
      }
    }

    return appointment
  })

  try {
    localStorage.setItem(
      'techconnectAppointments',
      JSON.stringify(updatedAppointments)
    )

    setAppointments(updatedAppointments)
  } catch {
    alert('Unable to save the cancellation. Please try again.')
  }
}

function handleReschedule(event, appointmentId) {
  event.preventDefault()

  const formData = new FormData(event.currentTarget)
  const newDate = formData.get('newDate')
  const newTime = formData.get('newTime')

  const appointment = appointments.find(
    (item) => item.id === appointmentId
  )

  if (
    !appointment ||
    String(appointment.status).toLowerCase() !== 'requested'
  ) {
    alert('This appointment request cannot be rescheduled.')
    return
  }

  const otherAppointments = appointments.filter(
    (item) => item.id !== appointmentId
  )

  const duplicateRequest = otherAppointments.some((item) =>
    item.providerId === appointment.providerId &&
    item.date === newDate &&
    item.time === newTime &&
    ['requested', 'confirmed'].includes(
      String(item.status).toLowerCase()
    )
  )

  if (duplicateRequest) {
    alert('This time already has an appointment request.')
    return
  }

  const booking = {
    serviceId: appointment.service,
    providerId: appointment.providerId,
    date: newDate,
    time: newTime,
  }

  const result = validateBooking(
    booking,
    availability,
    otherAppointments,
    { id: 'demo-resident', role: 'resident' }
  )

  if (!result.valid) {
    alert(result.error)
    return
  }

  const updatedAppointments = appointments.map((item) =>
    item.id === appointmentId
      ? { ...item, date: newDate, time: newTime }
      : item
  )

  try {
    localStorage.setItem(
      'techconnectAppointments',
      JSON.stringify(updatedAppointments)
    )

    setAppointments(updatedAppointments)
    setReschedulingId(null)
    alert('Your appointment request has been rescheduled!')
  } catch {
    alert('Unable to save the new appointment time.')
  }
}

function handleSaveAvailability(event) {
  event.preventDefault()

  const formData = new FormData(event.currentTarget)

  const providerId = formData.get('providerId')
  const date = formData.get('date')
  const startTime = formData.get('startTime')
  const endTime = formData.get('endTime')

  const validTime = /^([01]\d|2[0-3]):(00|30)$/

  if (
    !providers.some((provider) => provider.id === providerId) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date)
  ) {
    alert('Please select a valid provider and date.')
    return
  }

  if (!validTime.test(startTime) || !validTime.test(endTime)) {
    alert('Availability must begin and end on the hour or half-hour.')
    return
  }

  const toMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }

  const start = toMinutes(startTime)
  const end = toMinutes(endTime)

  if (end - start < 30) {
    alert('Availability must be at least 30 minutes long.')
    return
  }

  const overlaps = availability.some((slot) => {
    if (slot.providerId !== providerId || slot.date !== date) {
      return false
    }

    return (
      start < toMinutes(slot.endTime) &&
      end > toMinutes(slot.startTime)
    )
  })

  if (overlaps) {
    alert('This provider already has availability during these hours.')
    return
  }

  const updatedAvailability = [
    ...availability,
    { providerId, date, startTime, endTime },
  ]

  try {
    localStorage.setItem(
      'techconnectAvailability',
      JSON.stringify(updatedAvailability)
    )

    setAvailability(updatedAvailability)
    event.currentTarget.reset()
    alert('Provider availability saved!')
  } catch {
    alert('Unable to save availability. Please try again.')
  }
}

  return (
    <div className="app">
      <header className="header">
        <h2 className="logo">TechConnect<span>+</span></h2>
        <nav>
          <button onClick={() => setPage('home')}>Home</button>
          <button onClick={() => setPage('services')}>Services</button>
          <button onClick={() => setPage('booking')}>Book Support</button>
          <button onClick={() => setPage('appointments')}>My Appointments</button>
          <button onClick={() => setPage('provider')}>Provider Dashboard</button>
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
          <form className="booking-form" onSubmit={handleBooking}>
            <label>
              Full Name
              <input type="text" name="name" required placeholder="Enter your name" />
            </label>
            <label>
              Email Address
              <input type="email" name="email" required placeholder="Enter your email" />
            </label>
            <label>
              Select a Service
              <select name="service" required defaultValue="">
                <option value="" disabled>Choose a service</option>
                {services.map((service) => (
                  <option key={service.name} value={service.name}>
                    {service.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Select a Tech Support Provider
              <select name="providerId" required defaultValue="">
                <option value="" disabled>
                  Choose a provider
                  </option>
                  {providers.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name}
                      </option>
                    ))}
                    </select>
                    </label>
            <label>
              Preferred Date
              <input type="date" name="date" required />
            </label>
            <label>
              Preferred Appointment Time
              <select name="time" required defaultValue="">
                <option value="" disabled>
                  Choose a time
                  </option>
                  {[
                    '09:00', '09:30',
                    '10:00', '10:30',
                    '11:00', '11:30',
                    '12:00', '12:30',
                    '13:00', '13:30',
                    '14:00', '14:30',
                    '15:00', '15:30',
                    '16:00', '16:30',
                ].map((time) => (
                  <option key={time} value={time}>
                    {new Date(`2000-01-01T${time}:00`).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Describe Your Issue
              <textarea name="issue" placeholder="What do you need help with?" rows="4" />
            </label>
            <button className="primary" type="submit">Submit Booking</button>
          </form>
        </main>
      )}

      {page === 'appointments' && (
        <main className="content">
          <h1>My Appointments</h1>
          <p>View your technology-support appointment requests.</p>

          {appointments.length === 0 ? (
            <p>You don't have any appointment requests yet.</p>
          ) : (
            <div className="services">
              {appointments.map((appointment) => (
                <article className="service-card" key={appointment.id}>
                  <h3>{appointment.service}</h3>

                  <p><strong>Name:</strong> {appointment.name}</p>
                  <p><strong>Provider:</strong> {
                    providers.find(
                      (provider) => provider.id === appointment.providerId
                    )?.name || 'Not assigned'}
                  </p>
                  <p>
                    <strong>Date:</strong>{' '}
                    {appointment.date
                      ? new Date(`${appointment.date}T12:00:00`).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'Not selected'}
                    </p>
                  <p>
                    <strong>Time:</strong>{' '}
                    {appointment.time && /^([01]\d|2[0-3]):[0-5]\d$/.test(appointment.time)
                      ? new Date(`2000-01-01T${appointment.time}:00`).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })
                      : 'Not selected'}
                  </p>

                    <div 
                      className={`appointment-status ${String(
                        appointment.status || ''
                      ).toLowerCase()}`}
                      >
                      <p>
                        <strong>Status:</strong>{' '}
                        {appointment.status || 'Unknown'}
                      </p>

                      {String(appointment.status).toLowerCase() === 'requested' && (
                        <p>
                          Your appointment request has been received
                          and is awaiting confirmation.
                        </p>
                      )}

                      {String(appointment.status).toLowerCase() === 'confirmed' && (
                        <p>
                          Your appointment is confirmed.
                          We look forward to helping you!
                        </p>
                      )}

                      {String(appointment.status).toLowerCase() === 'canceled' && (
                        <p>
                          This appointment has been canceled.
                        </p>
                      )}
                    </div>
                    {String(appointment.status).toLowerCase() === 'requested' && (
                      <button
                        type="button"
                        className="secondary"
                        onClick={() => handleCancelRequest(appointment.id)}
                      >
                        Cancel Request
                      </button>
                    )}
                    {String(appointment.status).toLowerCase() === 'requested' && (
                       <button
                          type="button"
                          className="secondary"
                          onClick={() =>
                            setReschedulingId(
                              reschedulingId === appointment.id ? null : appointment.id
                            )
                          }
                        >
                          {reschedulingId === appointment.id
                            ? 'Close Rescheduling'
                            : 'Reschedule Request'}
                        </button>
                    )}
                    {reschedulingId === appointment.id && (                    
                      <form
                        className="booking-form"
                        onSubmit={(event) => handleReschedule(event, appointment.id)}
                      >
                        <h4>Choose a New Appointment Time</h4>
                        <label>
                          New Date
                          <input
                            type="date"
                            name="newDate"
                            required
                            defaultValue={appointment.date}
                          />
                        </label>

                        <label>
                          New Time
                          <select
                            name="newTime"
                            required
                            defaultValue={appointment.time || ''}
                          >
                            <option value="" disabled>
                              Choose a time
                            </option>

                            {[
                              '09:00', '09:30',
                              '10:00', '10:30',
                              '11:00', '11:30',
                              '12:00', '12:30',
                              '13:00', '13:30',
                              '14:00', '14:30',
                              '15:00', '15:30',
                              '16:00', '16:30',
                            ].map((time) => (
                              <option key={time} value={time}>
                                {new Date(`2000-01-01T${time}:00`).toLocaleTimeString(
                                  'en-US',
                                  {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                  }
                                )}
                              </option>
                            ))}
                          </select>
                        </label>

                        <button className="primary" type="submit">
                          Save New Appointment Time
                        </button>
                      </form>
                    )}

                </article>
              ))}
            </div>
          )}
        </main>
      )}

{page === 'provider' && (
  <main className="content">
    <h1>Provider Dashboard</h1>
    <p>
      View technology-support providers and their
      available appointment schedules.
    </p>

<section className="availability-management">
  <h2>Manage Availability</h2>
  <p>Add available appointment hours for a provider.</p>

  <form 
  className="booking-form"
  onSubmit={handleSaveAvailability}
  >
    <label>
      Select Provider
      <select name="providerId" required defaultValue="">
        <option value="" disabled>
          Choose a provider
        </option>
        {providers.map((provider) => (
          <option key={provider.id} value={provider.id}>
            {provider.name}
          </option>
        ))}
      </select>
    </label>

    <label>
      Available Date
      <input type="date" name="date" required />
    </label>

    <label>
      Start Time
      <input type="time" name="startTime" step="1800" required />
    </label>

    <label>
      End Time
      <input type="time" name="endTime" step="1800" required />
    </label>

    <button className="primary" type="submit">
      Save Availability
    </button>
  </form>
</section>

    <div className="services">
      {providers.map((provider) => (
        <article className="service-card" key={provider.id}>
          <h3>{provider.name}</h3>

          <h4>Available Hours</h4>

          {availability
            .filter((slot) => slot.providerId === provider.id)
            .map((slot) => (
              <div key={`${slot.providerId}-${slot.date}`}>
                <p>
                  <strong>Date:</strong> {slot.date}
                </p>
                <p>
                  <strong>Hours:</strong>{' '}
                  {slot.startTime} - {slot.endTime}
                </p>
              </div>
            ))}

            <h4>Assigned Appointment Requests</h4>

            {appointments.filter(
              (appointment) => appointment.providerId === provider.id
            ).length === 0 ? (
              <p>No appointment requests assigned.</p>
            ) : (
              appointments
                .filter((appointment) => appointment.providerId === provider.id)
                .map((appointment) => (
                  <div
                    key={appointment.id}
                    className="appointment-status"
                  >
                    <p>
                      <strong>Service:</strong> {appointment.service}
                    </p>
                    <p>
                      <strong>Date:</strong> {appointment.date}
                    </p>
                    <p>
                      <strong>Time:</strong> {appointment.time || 'Not selected'}
                    </p>
                    <p>
                      <strong>Status:</strong> {appointment.status}
                    </p>
                  </div>
                ))
            )}
        </article>
      ))}
    </div>
  </main>
)}

      <footer>© 2026 TechConnect. Technology made approachable.</footer>
    </div>
  )
}

export default App