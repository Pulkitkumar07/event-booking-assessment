import { ProtectedPage } from "@/components/protected-page";

export default function OrganizerPage() {
  return (
    <ProtectedPage organizerOnly>
      <main className="content-page">
        <p className="eyebrow">Organizer</p>
        <h1>Organizer dashboard</h1>
        <p>Event management will be added in the organizer milestone.</p>
      </main>
    </ProtectedPage>
  );
}
