import Link from "next/link";
import { formatEventDate, formatPrice } from "@/lib/format";

export function EventCard({ event }) {
  return (
    <article className="event-card">
      <div className="event-card-top">
        <span className={`status-badge ${event.soldOut ? "sold-out" : ""}`}>
          {event.soldOut ? "Sold out" : `${event.seatsRemaining} seats left`}
        </span>
        <span className="event-price">{formatPrice(event.price)}</span>
      </div>

      <div>
        <p className="event-date">{formatEventDate(event.startsAt)}</p>
        <h2>{event.title}</h2>
        <p className="event-venue">{event.venue}</p>
        <p className="event-organizer">By {event.organizer.name}</p>
      </div>

      <Link
        className="button button-secondary event-card-link"
        href={`/events/${event.id}`}
      >
        View details
      </Link>
    </article>
  );
}
