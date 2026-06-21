"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageState } from "@/components/page-state";
import { ProtectedPage } from "@/components/protected-page";
import { api, getApiErrorMessage } from "@/lib/axios";
import { formatEventDate, formatPrice } from "@/lib/format";

function BookingsContent() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    async function loadBookings() {
      try {
        const response = await api.get("/me/bookings");
        setBookings(response.data.bookings);
      } catch (requestError) {
        setError(
          getApiErrorMessage(requestError, "Unable to load your bookings")
        );
      } finally {
        setLoading(false);
      }
    }

    loadBookings();
  }, []);

  async function handleCancel(bookingId) {
    const shouldCancel = window.confirm(
      "Cancel this booking? The seat will become available again."
    );

    if (!shouldCancel) {
      return;
    }

    setCancellingId(bookingId);
    setActionError("");

    try {
      const response = await api.delete(`/bookings/${bookingId}`);

      setBookings((currentBookings) =>
        currentBookings.map((booking) =>
          booking.id === bookingId
            ? {
                ...booking,
                status: response.data.booking.status,
                cancelledAt: response.data.booking.cancelledAt
              }
            : booking
        )
      );
    } catch (requestError) {
      setActionError(
        getApiErrorMessage(requestError, "Unable to cancel this booking")
      );
    } finally {
      setCancellingId(null);
    }
  }

  if (loading) {
    return (
      <main className="bookings-page">
        <PageState
          message="We’re loading your booking history."
          title="Loading bookings..."
        />
      </main>
    );
  }

  if (error) {
    return (
      <main className="bookings-page">
        <PageState
          action={
            <button
              className="button button-secondary"
              onClick={() => window.location.reload()}
              type="button"
            >
              Try again
            </button>
          }
          message={error}
          title="Bookings could not be loaded"
        />
      </main>
    );
  }

  return (
    <main className="bookings-page">
      <section className="page-heading">
        <p className="eyebrow">My bookings</p>
        <h1>Your event plans, all in one place.</h1>
        <p>View confirmed bookings and keep cancelled bookings for reference.</p>
      </section>

      {actionError && <p className="form-error booking-action-error">{actionError}</p>}

      {bookings.length === 0 && (
        <PageState
          action={
            <Link className="button button-primary" href="/events">
              Browse events
            </Link>
          }
          message="When you book an event, it will appear here."
          title="You have no bookings yet"
        />
      )}

      {bookings.length > 0 && (
        <section className="bookings-list">
          {bookings.map((booking) => {
            const isConfirmed = booking.status === "CONFIRMED";

            return (
              <article className="booking-card" key={booking.id}>
                <div className="booking-card-main">
                  <div className="booking-card-heading">
                    <span
                      className={`status-badge ${
                        isConfirmed ? "" : "cancelled"
                      }`}
                    >
                      {isConfirmed ? "Confirmed" : "Cancelled"}
                    </span>
                    <span className="event-price">
                      {formatPrice(booking.event.price)}
                    </span>
                  </div>

                  <p className="event-date">
                    {formatEventDate(booking.event.startsAt)}
                  </p>
                  <h2>{booking.event.title}</h2>
                  <p className="event-venue">{booking.event.venue}</p>
                  <p className="event-organizer">
                    By {booking.event.organizer.name}
                  </p>
                </div>

                <div className="booking-card-actions">
                  <Link
                    className="button button-secondary"
                    href={`/events/${booking.event.id}`}
                  >
                    Event details
                  </Link>

                  {isConfirmed && (
                    <button
                      className="button button-danger"
                      disabled={cancellingId === booking.id}
                      onClick={() => handleCancel(booking.id)}
                      type="button"
                    >
                      {cancellingId === booking.id
                        ? "Cancelling..."
                        : "Cancel booking"}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}

export default function BookingsPage() {
  return (
    <ProtectedPage>
      <BookingsContent />
    </ProtectedPage>
  );
}
