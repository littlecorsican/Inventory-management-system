import { render, screen } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  // No backend in unit tests: every request returns an empty result
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ items: [], total: 0, rooms: 0, containers: 0, unassigned_items: 0, recent_items: [] }),
    })
  );
  window.matchMedia = window.matchMedia || ((query) => ({
    matches: false, media: query, addListener: () => {}, removeListener: () => {},
    addEventListener: () => {}, removeEventListener: () => {},
  }));
});

test('renders the dashboard', async () => {
  render(<App />);
  expect(screen.getByText(/home inventory/i)).toBeInTheDocument();
  expect(await screen.findByText(/your inventory is empty/i)).toBeInTheDocument();
});
