import React from 'react';
import SafeArea from 'react-safe-area-component';
import ReactDOM from 'react-dom/client';
import App from './App';
import {Provider} from 'react-redux';
import {Capacitor} from '@capacitor/core';
import {App as CapacitorApp} from '@capacitor/app';
import {defineCustomElements} from '@ionic/pwa-elements/loader';
import {store} from './store/store';

import {StatusBar, Style} from '@capacitor/status-bar';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <SafeArea
    top
    bottom>
    <Provider store={store}>
      <App isExtension={false} />
    </Provider>
  </SafeArea>
);

const isMobile =
  Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android';
if (
  window.matchMedia &&
  window.matchMedia('(prefers-color-scheme: dark)').matches
) {
  document.body.classList.toggle('dark');
  if (isMobile) StatusBar.setStyle({style: Style.Dark});
} else {
  // OS is light mode
  StatusBar.setStyle({style: Style.Light});
  document.body.classList.toggle('light');
  if (isMobile) StatusBar.setStyle({style: Style.Light});
}

// Enable PWA
defineCustomElements(window);

// Web
if (Capacitor.getPlatform() === 'web') {
  // get console.log error on web
  let origin = console.error;
  origin = (error) => {
    if (/Loading chunk [\d]+ failed/.test(error.message)) {
      alert(
        'A new version released. Need to reload the page to apply changes.'
      );
      window.location.reload();
    } else {
      origin(error);
    }
  };
}

// Capacitor App
if (isMobile) {
  // Display content under transparent status bar (Android only)
  //StatusBar.setOverlaysWebView({overlay: true});

  // Handle back button on capacitor app
  let timePeriodToExit = 3000; // ms
  let countBack = 0;
  let firstBack = 0;
  let secondBack = 0;
  CapacitorApp.addListener('backButton', ({canGoBack}) => {
    if (!canGoBack) {
      CapacitorApp.exitApp();
    } else {
      window.history.back();
    }

    countBack++;
    if (countBack === 1) {
      firstBack = new Date().getTime();
    }
    if (countBack === 2) {
      secondBack = new Date().getTime();
      if (secondBack - firstBack < timePeriodToExit) {
        const c = confirm('Do you want to exit?');
        if (c) {
          CapacitorApp.exitApp();
        } else {
          countBack = 0;
        }
      }
    }
  });
}

// Service worker
if (process.env.NODE_ENV === 'production') {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('SW registered service-worker.js: ', registration);
        })
        .catch((registrationError) => {
          console.log(
            'SW registration failed service-worker.js: ',
            registrationError
          );
        });
    });
  }
}
