import React from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductListPage from './ProductListPage';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';

  return (
    <ProductListPage
      initialQuery={q}
      pageTitle={q ? `Search results for "${q}"` : 'Search Products'}
    />
  );
}
