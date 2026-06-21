"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { EventCard } from "@/components/event-card";
import { PageState } from "@/components/page-state";
import { api, getApiErrorMessage } from "@/lib/axios";

const PAGE_SIZE = 6;

function EventsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const date = searchParams.get("date") ?? "";
  const page = Math.max(Number(searchParams.get("page")) || 1, 1);

  const [searchInput, setSearchInput] = useState(search);
  const [dateInput, setDateInput] = useState(date);
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setSearchInput(search);
    setDateInput(date);
  }, [search, date]);

  useEffect(() => {
    let ignore = false;

    async function loadEvents() {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/events", {
          params: {
            search: search || undefined,
            date: date || undefined,
            page,
            limit: PAGE_SIZE
          }
        });

        if (!ignore) {
          setEvents(response.data.events);
          setPagination(response.data.pagination);
        }
      } catch (requestError) {
        if (!ignore) {
          setError(getApiErrorMessage(requestError, "Unable to load events"));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadEvents();

    return () => {
      ignore = true;
    };
  }, [date, page, search]);

  function updateUrl(nextValues) {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(nextValues).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    router.push(`/events${params.toString() ? `?${params}` : ""}`);
  }

  function handleFilter(event) {
    event.preventDefault();
    updateUrl({
      search: searchInput.trim(),
      date: dateInput,
      page: ""
    });
  }

  function clearFilters() {
    setSearchInput("");
    setDateInput("");
    router.push("/events");
  }

  return (
    <main className="events-page">
      <section className="page-heading">
        <p className="eyebrow">Upcoming events</p>
        <h1>Find something worth showing up for.</h1>
        <p>Search local events, check availability, and view full details.</p>
      </section>

      <form className="event-filters" onSubmit={handleFilter}>
        <label>
          Search by title
          <input
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Music, meetup, festival..."
            type="search"
            value={searchInput}
          />
        </label>

        <label>
          Event date
          <input
            onChange={(event) => setDateInput(event.target.value)}
            type="date"
            value={dateInput}
          />
        </label>

        <button className="button button-primary" type="submit">
          Search events
        </button>

        {(search || date) && (
          <button
            className="button button-secondary"
            onClick={clearFilters}
            type="button"
          >
            Clear
          </button>
        )}
      </form>

      {!loading && !error && (
        <div className="results-summary">
          <p>
            {pagination.total}{" "}
            {pagination.total === 1 ? "event found" : "events found"}
          </p>
        </div>
      )}

      {loading && (
        <PageState
          message="We’re fetching the latest upcoming events."
          title="Loading events..."
        />
      )}

      {!loading && error && (
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
          title="Events could not be loaded"
        />
      )}

      {!loading && !error && events.length === 0 && (
        <PageState
          action={
            (search || date) && (
              <button
                className="button button-secondary"
                onClick={clearFilters}
                type="button"
              >
                Clear filters
              </button>
            )
          }
          message="Try a different title or date. New events will appear here."
          title="No upcoming events found"
        />
      )}

      {!loading && !error && events.length > 0 && (
        <>
          <section className="event-grid">
            {events.map((event) => (
              <EventCard event={event} key={event.id} />
            ))}
          </section>

          {pagination.totalPages > 1 && (
            <nav className="pagination" aria-label="Events pagination">
              <button
                className="button button-secondary"
                disabled={page <= 1}
                onClick={() => updateUrl({ page: String(page - 1) })}
                type="button"
              >
                Previous
              </button>
              <span>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                className="button button-secondary"
                disabled={page >= pagination.totalPages}
                onClick={() => updateUrl({ page: String(page + 1) })}
                type="button"
              >
                Next
              </button>
            </nav>
          )}
        </>
      )}
    </main>
  );
}

export default function EventsPage() {
  return (
    <Suspense
      fallback={
        <main className="events-page">
          <PageState
            message="We’re preparing the event list."
            title="Loading events..."
          />
        </main>
      }
    >
      <EventsContent />
    </Suspense>
  );
}
