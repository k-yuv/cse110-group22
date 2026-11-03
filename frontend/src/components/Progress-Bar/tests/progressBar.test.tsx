import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProgressBar from '../ProgressBar';

describe('ProgressBar component', () => {
  it('shows the label and completed count', () => {
    render(<ProgressBar completed={2} total={6} />);

    expect(screen.getByText('Progress')).toBeInTheDocument();
    expect(screen.getByText('2/6')).toBeInTheDocument();
  });

  it('accepts a custom label', () => {
    render(<ProgressBar completed={0} total={3} label="Questions" />);

    expect(screen.getByText('Questions')).toBeInTheDocument();
  });
});
