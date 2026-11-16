# TechConnect · Feature F1: Book an Appointment

This specification defines how residents and authorized caregivers book technology-support appointments through TechConnect.

The specification has two layers:
- **Behavior layer (human-led):** Booking rules, examples, and acceptance criteria.
- **Technical layer (AI-drafted, human-verified):** Functions, data structures, and implementation details.


## Traceability

| Source | ID | Text |
|---|---|---|
| User story | S1 | As a resident or authorized caregiver, I want to book an available technology-support appointment so I can get assistance when needed. |
| SRS | REQ-5 | The system shall allow an authenticated resident or caregiver to book an appointment for an available technology-support service and time. |
| SRS | REQ-6 | The system shall associate each confirmed appointment with a booking user, technology-support service, date, time, and status. |
| SRS | REQ-9 | The system shall display a booking confirmation containing the selected service, date, and time after an appointment is successfully created. |
| SRS | REQ-10 | The system shall prevent a second confirmed appointment from reserving a time slot that is already occupied by another appointment. |
| SRS | NFR-2 | If an appointment cannot be saved successfully, the system shall display an error and shall not show the appointment as confirmed. |
| Use case | UC-1 | Book Appointment |


## Rules

- **R1.** Only authenticated residents and authorized caregivers can book technology-support appointments.
- **R2.** A user must select a technology-support service and an available appointment date and time before booking.
- **R3.** Appointments are 30 minutes long, with start times on the hour or half-hour.
- **R4.** A technology-support provider cannot have two confirmed appointments that overlap.
- **R5.** The system must check provider availability before confirming an appointment.
- **R6.** A booking confirmation must display the selected service, date, and time after the appointment is successfully saved.
- **R7.** If the selected time is unavailable or the appointment cannot be saved, the system must display an error and must not show a booking confirmation.


## Acceptance Criteria

| ID | Given | When | Then |
|---|---|---|---|
| F1-AC1 | An authenticated resident or authorized caregiver has selected a service and an available appointment time | The user submits the booking request | The appointment is saved and a confirmation displays the service, date, and time. |
| F1-AC2 | A provider already has a confirmed appointment at the selected time | Another user attempts to book the same provider and time | The system rejects the booking, displays an error, and does not create another confirmed appointment. |
| F1-AC3 | A user is not authenticated | The user attempts to book an appointment | The system denies the booking request and does not save an appointment. |
| F1-AC4 | A service or appointment time has not been selected | The user attempts to submit the booking form | The system identifies the missing information and does not save the appointment. |
| F1-AC5 | An authenticated user selects a valid 30-minute appointment beginning on the hour or half-hour | The user submits the booking request and the selected provider is available | The system saves the appointment with the selected date and time. |
| F1-AC6 | The application cannot successfully save an appointment | The user submits a booking request | The system displays an error and does not show the appointment as confirmed. |


## Boundary Examples

The following examples define expected booking behavior based on the rules and acceptance criteria.

| Input or Scenario | Expected Result |
|---|---|
| Book an available appointment at 9:00 AM | Booking accepted if all other requirements are met. |
| Book an available appointment at 9:30 AM | Booking accepted if all other requirements are met. |
| Book an appointment at 9:15 AM | Booking rejected because appointments must start on the hour or half-hour. |
| Book a 30-minute appointment | Booking accepted if the provider is available. |
| Book a time already reserved for the same provider | Booking rejected to prevent double-booking. |
| Book the same time with a different available provider | Booking accepted if all other requirements are met. |
| Submit a booking without selecting a service | Booking rejected with a message identifying the missing service. |
| Submit a booking without being logged in | Booking denied and no appointment saved. |
| Appointment fails to save | Error displayed and no booking confirmation shown. |


## Interface

The following JavaScript functions will support TechConnect's appointment-booking feature.

The booking-validation functions will be implemented in `src/booking.js`. These functions should not directly interact with the user interface, browser storage, or network. They should return predictable results that can be tested independently.

### Functions

- `isValidStartTime(time)`
  - Returns `true` when the appointment starts on the hour or half-hour.
  - Returns `false` for other start times or invalid time values.

- `isSlotAvailable(availability, appointments, providerId, date, time)`
  - Returns `true` only when the provider has an available 30-minute time slot matching the requested date and time, and no confirmed appointment conflicts with it.
  - Returns `false` when the provider has not offered that time or the time conflicts with an existing confirmed appointment.
  - Does not modify the input arrays.

- `validateBooking(booking, availability, appointments, currentUser)`
  - Checks that the user is authenticated and has permission to book.
  - Verifies that all required booking information is provided.
  - Checks that the appointment starts on the hour or half-hour.
  - Uses `isSlotAvailable()` to verify provider availability and prevent scheduling conflicts.
  - Returns `{ valid: true, error: null }` when all checks pass.
  - Returns `{ valid: false, error: "message" }` when a rule is violated.
  - Does not modify the input objects or arrays.
  - The backend must independently verify the user's identity and authorization before saving.

### Responsibilities

- The React user interface collects booking information and displays validation messages.
- The booking functions check the rules defined in this specification.
- The backend must independently enforce authentication, authorization, and scheduling rules before saving an appointment.
- The application displays a booking confirmation only after the backend confirms the appointment was saved successfully.


### Data Shapes

The following objects describe the information used by TechConnect's appointment-booking feature. These are proposed structures and may be updated as the backend and database are developed.

```js
// A registered user
{
  id: "user-001",
  name: "Example Resident",
  email: "resident@example.com",
  role: "resident" // "resident", "caregiver", or "techsupport"
}

// A technology support service
{
  id: "service-001",
  name: "Smartphone Assistance",
  description: "Help with everyday smartphone questions."
}

// Provider availability
{
  providerId: "provider-001",
  date: "2026-12-01",
  startTime: "09:00",
  endTime: "12:00"
}

// An appointment
{
  id: "appointment-001",
  userId: "user-001",
  providerId: "provider-001",
  serviceId: "service-001",
  date: "2026-12-01",
  time: "09:00",
  status: "confirmed" // "confirmed" or "canceled"
}

// A booking request
{
  userId: "user-001",
  providerId: "provider-001",
  serviceId: "service-001",
  date: "2026-12-01",
  time: "09:00"
}
```

### Data Rules

- Appointment dates use the format `YYYY-MM-DD`.
- Appointment times use 24-hour `HH:MM` format.
- Each appointment is associated with a user, provider, and service.
- Only confirmed appointments occupy provider time slots.
- The appointment duration is 30 minutes.
- The backend must determine the authenticated user's identity and permissions. It must not trust a `userId` supplied by the browser.


### Input

- The React interface will allow residents and authorized caregivers to select a technology-support service, provider, date, and available appointment time.
- Users will submit booking requests by selecting a clearly labeled **Book Appointment** button.
- Form controls must support keyboard navigation.
- The interface will display validation errors when required information is missing or invalid.
- The React interface will call the booking-validation functions before submitting a request.
- The backend must repeat all security and scheduling checks before saving an appointment.
- Booking confirmation will appear only after the appointment is successfully saved.

## Parked Questions (answered during later development)

- How will caregivers be linked to residents and authorized to manage their appointments?
- Which backend framework and database will TechConnect use?
- How will TechConnect handle time zones and past appointment dates?
- Can residents have multiple upcoming appointments?
- What happens when a provider has no available appointment times?
- How will appointment information be backed up and recovered?

## Out of Scope for F1

The following functionality is not part of the initial appointment-booking feature:

- Payment processing
- Live chat
- Automated email or text reminders
- Training session registration
- Appointment cancellation and rescheduling (covered by separate features)
- Provider availability management (covered by a separate feature)

