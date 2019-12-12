import React, { lazy, Suspense } from 'react';
import { boundary, useError } from 'react-boundary';

import { Router } from '@reach/router';

import { errors } from '../terms.en-us.json';

const FontAwesomeIcons = lazy(() =>
  import('./element/FontAwesomeIcons').then(module => ({ default: module.FontAwesomeIcons }))
);
const Error = lazy(() => import('./shared/Error').then(module => ({ default: module.Error })));

export const App = boundary(() => {
  const [error, info] = useError();

  if (error || info) {
    return <Error stack={`${error && error.stack}${info && info.componentStack}`} />;
  }

  return (
    <>
      <Suspense fallback={''}>
        <Router>
          <FontAwesomeIcons path='/' />
          <Error path='/error' default message={errors.notFound} />
        </Router>
      </Suspense>
    </>
  );
});
