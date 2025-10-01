/**
 * @vitest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '../app/page';

// Mock fetch
global.fetch = vi.fn();

describe('Home Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form', () => {
    render(<Home />);
    
    expect(screen.getByText('Item Analyzer')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Item URL')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Analyze Item' })).toBeInTheDocument();
  });

  it('submits the form successfully', async () => {
    (global.fetch as vi.Mock).mockResolvedValueOnce({
      text: () => Promise.resolve('Analysis complete')
    });

    render(<Home />);
    
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'Test item' }
    });
    fireEvent.change(screen.getByLabelText('Item URL'), {
      target: { value: 'http://test.com' }
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'Analyze Item' }));
    
    await waitFor(() => {
      expect(screen.getByText('Analysis complete')).toBeInTheDocument();
    });
    
    expect(global.fetch).toHaveBeenCalledWith('/api/analyze', expect.any(Object));
  });

  it('handles form submission error', async () => {
    (global.fetch as vi.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<Home />);
    
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'Test item' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'Analyze Item' }));
    
    await waitFor(() => {
      expect(screen.getByText('Error: Network error')).toBeInTheDocument();
    });
  });

  it('shows loading state during submission', async () => {
    (global.fetch as vi.Mock).mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve({ text: () => 'Done' }), 100))
    );

    render(<Home />);
    
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'Test' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'Analyze Item' }));
    
    expect(screen.getByRole('button', { name: 'Analyzing...' })).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Done')).toBeInTheDocument();
    });
  });

  it('supports different report formats', () => {
    render(<Home />);
    
    const formatSelect = screen.getByLabelText('Report Format');
    expect(formatSelect).toBeInTheDocument();
    
    fireEvent.change(formatSelect, { target: { value: 'json' } });
    expect(formatSelect).toHaveValue('json');
  });
});