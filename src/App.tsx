import { hot } from 'react-hot-loader';
import * as React from 'react';

const App = (): JSX.Element =>
  <div>
    TEST_VAR: {process.env.TEST_VAR}<br />
    NODE_ENV: {process.env.NODE_ENV}<br />
    ELECTRON_IS_DEV: {process.env.ELECTRON_IS_DEV}<br />
  </div>;

export default hot(module)(App);