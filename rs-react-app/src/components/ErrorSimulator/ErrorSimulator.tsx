import React from 'react';

export const ErrorSimulator: React.FC = () => {
  throw new Error('Simulated error!');
  /* istanbul ignore next */
  return null;
};
