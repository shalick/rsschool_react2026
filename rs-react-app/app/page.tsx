import { Suspense } from 'react';
import { HomePage } from '../src/page-components/HomePage';

export default function HomeRoute() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomePage />
    </Suspense>
  );
}
