import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import Button from '../src/components/ui/Button.jsx';
import ProgressBar from '../src/components/ui/ProgressBar.jsx';
import EmptyState from '../src/components/ui/EmptyState.jsx';
import Tabs from '../src/components/ui/Tabs.jsx';

describe('shared UI components', () => {
  it('disables a button while loading and exposes busy state', () => {
    render(<Button loading>Saving</Button>);
    const button = screen.getByRole('button', { name: /saving/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('clamps progress to the 0–100 range', () => {
    render(<ProgressBar value={135} showValue label="Course progress" />);
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });

  it('renders an accessible empty state', () => {
    render(<EmptyState title="No bookmarks" text="Save a lesson to find it later." />);
    expect(screen.getByRole('status')).toHaveTextContent('No bookmarks');
  });

  it('switches tabs and calls the controlled change handler', () => {
    const onChange = vi.fn();
    render(<Tabs value="overview" onChange={onChange} items={[
      { value: 'overview', label: 'Overview', content: 'Overview content' },
      { value: 'lessons', label: 'Lessons', content: 'Lesson content' },
    ]} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Lessons' }));
    expect(onChange).toHaveBeenCalledWith('lessons');
  });
});
