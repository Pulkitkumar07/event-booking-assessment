"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { PageState } from "@/components/page-state";
import { ProtectedPage } from "@/components/protected-page";
import { api, getApiErrorMessage } from "@/lib/axios";
import { formatEventDate, formatPrice } from "@/lib/format";

function toDateTimeInput(value) {
  const date = new Date(value);
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}

function OrganizerDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [formError, setFormError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [attendeesByEvent, setAttendeesByEvent] = useState({});
  const [loadingAttendeesId, setLoadingAttendeesId] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm();

  async function loadEvents() {
    setPageError("");

    try {
      const response = await api.get("/organizer/events");
      setEvents(response.data.events);
    } catch (requestError) {
      setPageError(
        getApiErrorMessage(requestError, "Unable to load organizer events")
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  async function onSubmit(formData) {
    setFormError("");

    const payload = {
      ...formData,
      startsAt: new Date(formData.startsAt).toISOString(),
      capacity: Number(formData.capacity),
      price: Number(formData.price)
    };

    try {
      if (editingId) {
        const response = await api.patch(
          `/organizer/events/${editingId}`,
          payload
        );
        setEvents((currentEvents) =>
          currentEvents.map((event) =>
            event.id === editingId ? response.data.event : event
          )
        );
      } else {
        const response = await api.post("/organizer/events", payload);
        setEvents((currentEvents) =>
          [...currentEvents, response.data.event].sort(
            (first, second) =>
              new Date(first.startsAt) - new Date(second.startsAt)
          )
        );
      }

      clearForm();
    } catch (requestError) {
      setFormError(
        getApiErrorMessage(requestError, "Unable to save the event")
      );
    }
  }

  function startEditing(event) {
    setEditingId(event.id);
    setFormError("");
    reset({
      title: event.title,
      description: event.description,
      venue: event.venue,
      startsAt: toDateTimeInput(event.startsAt),
      capacity: event.capacity,
      price: event.price
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function clearForm() {
    setEditingId(null);
    setFormError("");
    reset({
      title: "",
      description: "",
      venue: "",
      startsAt: "",
      capacity: "",
      price: ""
    });
  }

  async function toggleAttendees(eventId) {
    if (attendeesByEvent[eventId]) {
      setAttendeesByEvent((current) => {
        const next = { ...current };
        delete next[eventId];
        return next;
      });
      return;
    }

    setLoadingAttendeesId(eventId);

    try {
      const response = await api.get(
        `/organizer/events/${eventId}/attendees`
      );
      setAttendeesByEvent((current) => ({
        ...current,
        [eventId]: response.data.attendees
      }));
    } catch (requestError) {
      setPageError(
        getApiErrorMessage(requestError, "Unable to load attendees")
      );
    } finally {
      setLoadingAttendeesId(null);
    }
  }

  return (
    <main className="organizer-page">
      <section className="page-heading">
        <p className="eyebrow">Organizer dashboard</p>
        <h1>Create events and manage attendance.</h1>
        <p>Keep event details clear and review confirmed attendees.</p>
      </section>

      <section className="organizer-form-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{editingId ? "Edit event" : "New event"}</p>
            <h2>{editingId ? "Update event details" : "Create an event"}</h2>
          </div>
          {editingId && (
            <button
              className="button button-secondary button-small"
              onClick={clearForm}
              type="button"
            >
              Cancel edit
            </button>
          )}
        </div>

        {formError && <p className="form-error">{formError}</p>}

        <form className="organizer-form" onSubmit={handleSubmit(onSubmit)}>
          <label className="wide-field">
            Title
            <input
              {...register("title", {
                required: "Title is required",
                maxLength: {
                  value: 200,
                  message: "Title cannot exceed 200 characters"
                }
              })}
            />
            {errors.title && (
              <span className="field-error">{errors.title.message}</span>
            )}
          </label>

          <label className="wide-field">
            Description
            <textarea
              rows="5"
              {...register("description", {
                required: "Description is required",
                maxLength: {
                  value: 5000,
                  message: "Description cannot exceed 5000 characters"
                }
              })}
            />
            {errors.description && (
              <span className="field-error">{errors.description.message}</span>
            )}
          </label>

          <label>
            Venue
            <input
              {...register("venue", {
                required: "Venue is required",
                maxLength: {
                  value: 255,
                  message: "Venue cannot exceed 255 characters"
                }
              })}
            />
            {errors.venue && (
              <span className="field-error">{errors.venue.message}</span>
            )}
          </label>

          <label>
            Date and time
            <input
              type="datetime-local"
              {...register("startsAt", {
                required: "Date and time are required"
              })}
            />
            {errors.startsAt && (
              <span className="field-error">{errors.startsAt.message}</span>
            )}
          </label>

          <label>
            Capacity
            <input
              min="1"
              step="1"
              type="number"
              {...register("capacity", {
                required: "Capacity is required",
                min: {
                  value: 1,
                  message: "Capacity must be at least 1"
                }
              })}
            />
            {errors.capacity && (
              <span className="field-error">{errors.capacity.message}</span>
            )}
          </label>

          <label>
            Price (₹)
            <input
              min="0"
              step="0.01"
              type="number"
              {...register("price", {
                required: "Price is required",
                min: {
                  value: 0,
                  message: "Price cannot be negative"
                }
              })}
            />
            {errors.price && (
              <span className="field-error">{errors.price.message}</span>
            )}
          </label>

          <button
            className="button button-primary wide-field"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting
              ? "Saving event..."
              : editingId
                ? "Save changes"
                : "Create event"}
          </button>
        </form>
      </section>

      <section className="organizer-events-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Your events</p>
            <h2>Event overview</h2>
          </div>
        </div>

        {pageError && <p className="form-error">{pageError}</p>}

        {loading && (
          <PageState
            message="We’re loading your organizer events."
            title="Loading events..."
          />
        )}

        {!loading && !pageError && events.length === 0 && (
          <PageState
            message="Use the form above to create your first event."
            title="No events created yet"
          />
        )}

        {!loading && events.length > 0 && (
          <div className="organizer-event-list">
            {events.map((event) => {
              const attendees = attendeesByEvent[event.id];

              return (
                <article className="organizer-event-card" key={event.id}>
                  <div className="organizer-event-info">
                    <p className="event-date">
                      {formatEventDate(event.startsAt)}
                    </p>
                    <h3>{event.title}</h3>
                    <p className="event-venue">{event.venue}</p>
                    <div className="organizer-event-stats">
                      <span>{formatPrice(event.price)}</span>
                      <span>
                        {event.confirmedBookings} / {event.capacity} booked
                      </span>
                      <span>{event.seatsRemaining} seats left</span>
                    </div>
                  </div>

                  <div className="organizer-event-actions">
                    <Link
                      className="button button-secondary button-small"
                      href={`/events/${event.id}`}
                    >
                      View
                    </Link>
                    <button
                      className="button button-secondary button-small"
                      onClick={() => startEditing(event)}
                      type="button"
                    >
                      Edit
                    </button>
                    <button
                      className="button button-secondary button-small"
                      disabled={loadingAttendeesId === event.id}
                      onClick={() => toggleAttendees(event.id)}
                      type="button"
                    >
                      {loadingAttendeesId === event.id
                        ? "Loading..."
                        : attendees
                          ? "Hide attendees"
                          : "View attendees"}
                    </button>
                  </div>

                  {attendees && (
                    <div className="attendee-panel">
                      <h4>Confirmed attendees ({attendees.length})</h4>
                      {attendees.length === 0 ? (
                        <p>No confirmed attendees yet.</p>
                      ) : (
                        <div className="attendee-list">
                          {attendees.map((attendee) => (
                            <div
                              className="attendee-row"
                              key={attendee.bookingId}
                            >
                              <div>
                                <strong>{attendee.name}</strong>
                                <span>{attendee.email}</span>
                              </div>
                              <span>
                                Booked {formatEventDate(attendee.bookedAt)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

export default function OrganizerPage() {
  return (
    <ProtectedPage organizerOnly>
      <OrganizerDashboard />
    </ProtectedPage>
  );
}
