import { render, screen } from '@testing-library/react';
import NewsArticle from '../newsArticleView';
import { describe, it, expect } from 'vitest';


describe('NewsArticle', () => {
  it('renders the heading', () => {
    render(<NewsArticle />);
    expect(screen.getByRole('heading', { name: 'News Article' })).toBeInTheDocument();
  });
});