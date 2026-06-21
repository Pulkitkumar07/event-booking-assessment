import { ProtectedPage } from "@/components/protected-page";

export default function BookingsPage() {
  return (
    <ProtectedPage>
      <main className="content-page">
        <p className="eyebrow">My bookings</p>
        <h1>Your booked events</h1>
        <p>Booking details will be added in the booking milestone.</p>
      </main>
    </ProtectedPage>
  );
}
