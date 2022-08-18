import { render, screen } from '@testing-library/react';
import App from './App';

test('renders volley stats here message', () => {
  render(<App />);
  const linkElement = screen.getByText(/volley stats here/i);
  expect(linkElement).toBeInTheDocument();
});
