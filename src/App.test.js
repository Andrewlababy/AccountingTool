import { render, screen } from '@testing-library/react';
import App from './App';

test('renders OCR invoice system', () => {
  render(<App />);
  const titleElement = screen.getByText(/OCR發票識別記帳系統/i);
  expect(titleElement).toBeInTheDocument();
});
