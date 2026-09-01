import { mockTickets } from './lib/mock-tickets';

export default function HomePage() {
  return (
    <main>
      <h1>Parking Tickets</h1>
      <ul>
        {mockTickets.map((ticket) => (
          <li key={ticket.id}>
            {ticket.plate} — {ticket.status}
          </li>
        ))}
      </ul>
    </main>
  );
}
