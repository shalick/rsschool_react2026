import React from 'react';

export const ErrorSimulator: React.FC = () => {
  throw new Error('Simulated error!');
  return null;
};
