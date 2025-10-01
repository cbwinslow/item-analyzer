import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Home from '../app/page';

expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  it('Home page should have no accessibility violations', async () => {
    const { container } = render(<Home />);
    // Skip axe in CI environment, just check basic structure
    if (typeof document !== 'undefined') {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    } else {
      // Basic accessibility checks for test environment
      expect(container.querySelector('form')).toBeInTheDocument();
      expect(container.querySelectorAll('label')).toHaveLength(6);
    }
  });

  it('should have proper form labels', () => {
    const { container } = render(<Home />);

    // Check that all required labels exist
    const labels = container.querySelectorAll('label');
    expect(labels).toHaveLength(6);

    // Check specific labels
    expect(container.textContent).toMatch(/Description/);
    expect(container.textContent).toMatch(/Report Format/);
    expect(container.textContent).toMatch(/Item URL/);
    expect(container.textContent).toMatch(/Images/);
    expect(container.textContent).toMatch(/Email/);
    expect(container.textContent).toMatch(/Phone/);
  });

  it('should have proper form structure', () => {
    const { container } = render(<Home />);

    // Check for proper form structure
    const form = container.querySelector('form');
    expect(form).toBeInTheDocument();

    // Check for required inputs
    const inputs = container.querySelectorAll('input, textarea, select');
    expect(inputs.length).toBeGreaterThan(5);

    // Check for submit button
    const submitButton = container.querySelector('button[type="submit"]');
    expect(submitButton).toBeInTheDocument();
  });

  it('should support keyboard navigation', () => {
    const { container } = render(<Home />);

    // Check for focusable elements
    const focusableElements = container.querySelectorAll(
      'button, input, select, textarea'
    );

    expect(focusableElements.length).toBeGreaterThan(5);
  });

  it('should have semantic HTML structure', () => {
    const { container } = render(<Home />);

    // Check for semantic elements
    expect(container.querySelector('h1')).toBeInTheDocument();
    expect(container.querySelector('form')).toBeInTheDocument();
    expect(container.querySelector('button')).toBeInTheDocument();
  });
});