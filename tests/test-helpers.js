import jQuery from 'jquery';
import sinonChai from 'sinon-chai';
import jqueryChai from 'chai-jquery';
import chai from 'chai';

import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import Pretender from 'pretender';

// set up our assertion library
chai.use(sinonChai);
chai.use((chai, utils) => jqueryChai(chai, utils, jQuery));

// this will force fetch to be polyfilled with XHR for pretender
delete window.fetch;

// allows us to import jQuery from test-helpers
export const $ = jQuery;

// this will hold our testing context later
let testingContext = null;

// set up acceptance testing for an app
export function setupAcceptanceTestingForApp(App) {
  let container;

  beforeEach(function() {
    // set up our container where we mount our app
    container = document.createElement('div');
    container.id = '#testing';
    document.body.appendChild(container);

    // mount the app with props.test === true
    this.app = render(<App test/>, container);

    // setup pretender
    this.server = new Pretender();

    // expose this test's context for other helpers
    testingContext = this;
  });

  afterEach(function() {
    // unmount the app and destroy our container
    unmountComponentAtNode(container);
    document.body.removeChild(container);
    container = null;

    // pretender teardown
    this.server.shutdown();

    // clean up our exposed context
    testingContext = null;
  });
}

// visits a url using the app's router history api
export function visit(location) {
  if (testingContext) {
    const router  = testingContext.app.router;
    router.history.push(location);
  }
}

// helper to loop over assertions until the test timeout
export function assertUntilTimeout(fn) {
  (function loop() {
    try { fn(); } catch(e) {
      requestAnimationFrame(loop);
    }
  })();
}
