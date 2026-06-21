"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PageState } from "@/components/page-state";
import { api, getApiErrorMessage } from "@/lib/axios";
import { formatEventDate, formatPrice } from "@/lib/format";
import { useAppSelector } from "@/store/hooks";

export default function EventDetailsPage() {
  const { id } = useParams();
  const { user, loading: sessionLoading } = useAppSelector(
    (state) => state.auth
  );
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadEvent() {
      setLoading(true);
      setError("");

      try {
        const response = await api.get(`/events/${id}`);

        if (!ignore) {
          setEvent(response.data.event);
        }
      } catch (requestError) {
        if (!ignore) {
          setError(getApiErrorMessage(requestError, "Unable to load event"));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadEvent();

    return () => {
      ignore = true;
    };
  }, [id]);

  async function handleBooking() {
    setBooking(true);
    setBookingError("");
    setBookingSuccess("");

    try {
      const response = await api.post(`/events/${id}/book`);

      setEvent((currentEvent) => ({
        ...currentEvent,
        confirmedBookings: currentEvent.confirmedBookings + 1,
        seatsRemaining: response.data.seatsRemaining,
        soldOut: response.data.seatsRemaining === 0
      }));
      setBookingSuccess("Your seat is confirmed.");
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, "Booking failed");
      setBookingError(message);

      if (message.toLowerCase().includes("sold out")) {
        setEvent((currentEvent) => ({
          ...currentEvent,
          seatsRemaining: 0,
          soldOut: true
        }));
      }
    } finally {
      setBooking(false);
    }
  }

  if (loading) {
    return (
      <main className="event-detail-page">
        <PageState
          message="We’re loading the latest event information."
          title="Loading event..."
        />
      </main>
    );
  }

  if (error || !event) {
    return (
      <main className="event-detail-page">
        <PageState
          action={
            <Link className="button button-secondary" href="/events">
              Back to events
            </Link>
          }
          message={error || "This event is not available."}
          title="Event not found"
        />
      </main>
    );
  }

  return (
    <main className="event-detail-page">
      <Link className="back-link" href="/events">
        ← Back to events
      </Link>

      <div className="event-detail-layout">
        <article className="event-detail-card">
          <p className="event-date">{formatEventDate(event.startsAt)}</p>
          <h1>{event.title}</h1>
          <p className="event-detail-description">{event.description}</p>

          <dl className="event-facts">
            <div>
              <dt>Venue</dt>
              <dd>{event.venue}</dd>
            </div>
            <div>
              <dt>Organizer</dt>
              <dd>{event.organizer.name}</dd>
            </div>
            <div>
              <dt>Date and time</dt>
              <dd>{formatEventDate(event.startsAt)}</dd>
            </div>
          </dl>
        </article>

        <aside className="booking-summary">
          <p className="booking-price">{formatPrice(event.price)}</p>

          <div className={`availability ${event.soldOut ? "sold-out" : ""}`}>
            <strong>{event.soldOut ? "Sold out" : "Seats available"}</strong>
            <span>
              {event.soldOut
                ? "This event has reached capacity."
                : `${event.seatsRemaining} of ${event.capacity} seats remaining`}
            </span>
          </div>

          {bookingSuccess && (
            <p className="booking-message success">{bookingSuccess}</p>
          )}

          {bookingError && (
            <p className="booking-message error">{bookingError}</p>
          )}

          {!sessionLoading && !user && !event.soldOut && (
            <Link className="button button-primary full-width" href="/login">
              Login to book
            </Link>
          )}

          {!sessionLoading && user && !event.soldOut && (
            <button
              className="button button-primary full-width"
              disabled={booking || Boolean(bookingSuccess)}
              onClick={handleBooking}
              type="button"
            >
              {booking
                ? "Booking your seat..."
                : bookingSuccess
                  ? "Booking confirmed"
                  : "Book one seat"}
            </button>
          )}

          {event.soldOut && (
            <button className="button button-secondary full-width" disabled>
              No seats available
            </button>
          )}
        </aside>
      </div>
    </main>
  );
}
