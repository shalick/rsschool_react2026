import React from 'react';
import classes from './Loader.module.css';

function LoaderComponent() {
  return (
    <div className={classes.container}>
      <div className={classes.spinner} />
      <p className={classes.text}>Loading countries…</p>
    </div>
  );
}

export const Loader = React.memo(LoaderComponent);
