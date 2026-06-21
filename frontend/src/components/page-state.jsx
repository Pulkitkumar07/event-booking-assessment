export function PageState({ title, message, action }) {
  return (
    <section className="page-state">
      <h2>{title}</h2>
      <p>{message}</p>
      {action}
    </section>
  );
}
