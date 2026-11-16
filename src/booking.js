
/**
 * Checks whether an appointment starts on the hour
 * or half-hour using 24-hour HH:MM format.
 *
 * Examples:
 * "09:00" -> true
 * "09:30" -> true
 * "09:15" -> false
 */
export function isValidStartTime(time) {
  if (typeof time !== 'string') {
    return false
  }

  const match = /^([01]\d|2[0-3]):(00|30)$/.exec(time)

  return match !== null
}


/**
 * Checks whether a provider has an available 30-minute
 * appointment slot with no confirmed booking conflict.
 */
export function isSlotAvailable(
  availability,
  appointments,
  providerId,
  date,
  time
) {
  if (!Array.isArray(availability) || !Array.isArray(appointments)) {
    return false
  }

  if (!providerId || !date || !isValidStartTime(time)) {
    return false
  }

  const toMinutes = (value) => {
    const [hours, minutes] = value.split(':').map(Number)
    return hours * 60 + minutes
  }

  const requestedStart = toMinutes(time)
  const requestedEnd = requestedStart + 30

  // Check whether the provider offers this time.
  const providerAvailable = availability.some((slot) => {
    if (slot.providerId !== providerId || slot.date !== date) {
      return false
    }

    if (
      !slot.startTime ||
      !slot.endTime ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(slot.startTime) ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(slot.endTime)
    ) {
      return false
    }

    return (
      requestedStart >= toMinutes(slot.startTime) &&
      requestedEnd <= toMinutes(slot.endTime)
    )
  })

  if (!providerAvailable) {
    return false
  }

  // Check for overlapping confirmed appointments.
  const hasConflict = appointments.some((appointment) => {
    if (
      appointment.providerId !== providerId ||
      appointment.date !== date ||
      appointment.status !== 'confirmed'
    ) {
      return false
    }

    if (!isValidStartTime(appointment.time)) {
      return false
    }

    const existingStart = toMinutes(appointment.time)
    const existingEnd = existingStart + 30

    return (
      requestedStart < existingEnd &&
      requestedEnd > existingStart
    )
  })

  return !hasConflict
}


/**
 * Validates an appointment booking request.
 * Returns a result without modifying any input data.
 *
 * currentUser is supplied by the application.
 * The backend must independently verify authentication
 * and authorization before saving an appointment.
 */
export function validateBooking(
  booking,
  availability,
  appointments,
  currentUser
) {
  if (!currentUser || !currentUser.id) {
    return { valid: false, error: 'Please log in to book an appointment.' }
  }

  if (!['resident', 'caregiver'].includes(currentUser.role)) {
    return { valid: false, error: 'You are not authorized to book appointments.' }
  }

  if (!booking || typeof booking !== 'object') {
    return { valid: false, error: 'Booking information is required.' }
  }

  if (!booking.serviceId) {
    return { valid: false, error: 'Please select a service.' }
  }

  if (!booking.providerId) {
    return { valid: false, error: 'Please select a provider.' }
  }

  if (!booking.date) {
    return { valid: false, error: 'Please select an appointment date.' }
  }

  if (!booking.time) {
    return { valid: false, error: 'Please select an appointment time.' }
  }

  if (!isValidStartTime(booking.time)) {
    return {
      valid: false,
      error: 'Appointments must start on the hour or half-hour.',
    }
  }

  if (
    !isSlotAvailable(
      availability,
      appointments,
      booking.providerId,
      booking.date,
      booking.time
    )
  ) {
    return {
      valid: false,
      error: 'This appointment time is unavailable. Please choose another time.',
    }
  }

  return { valid: true, error: null }
}
