import { Component } from 'react';
import classes from './Loader.module.css';

export class Loader extends Component {
  render() {
    return (
      <div className={classes.container}>
        <div className={classes.spinner} />
        <p className={classes.text}>Loading countries…</p>
      </div>
    );
  }
}
