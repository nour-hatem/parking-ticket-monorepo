'use client';

import React, { useState } from 'react';
import { createTicket } from '../lib/api';

interface TicketFormProps {
  onSuccess?: () => void;
}

export const TicketForm: React.FC<TicketFormProps> = ({ onSuccess }) => {
  const [plate, setPlate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!plate.trim()) return;

    setLoading(true);
    setError(null);

    try {
      await createTicket({ plate: plate.trim() });
      setPlate('');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="ticket-form">
      <h3>Issue New Parking Ticket</h3>
      {error && <div className="form-error">{error}</div>}
      <div className="form-group">
        <input
          type="text"
          value={plate}
          onChange={(e) => setPlate(e.target.value)}
          placeholder="Enter plate e.g. ABC-1234"
          disabled={loading}
          required
        />
        <button type="submit" disabled={loading || !plate.trim()}>
          {loading ? 'Issuing...' : 'Create Ticket'}
        </button>
      </div>
    </form>
  );
};
