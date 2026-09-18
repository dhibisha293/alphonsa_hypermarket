import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProductListPage from './ProductListPage';
import * as api from '../../services/api';

export default function CategoryPage() {
  const { slug } = useParams();
  const [categoryName, setCategoryName] = useState('');

  useEffect(() => {
    api.getCategories().then(res => {
      if (res.success) {
        const found = (res.data || []).find(c => c.slug === slug);
        if (found) setCategoryName(found.name);
      }
    }).catch(() => {});
  }, [slug]);

  return (
    <ProductListPage
      initialCategory={slug}
      pageTitle={categoryName || slug?.replace(/-/g, ' ') || 'Products'}
    />
  );
}
