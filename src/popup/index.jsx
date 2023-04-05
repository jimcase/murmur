import React from 'react';
import SafeArea from 'react-safe-area-component';
import ReactDOM from 'react-dom/client';
import App from '../App';
import {defineCustomElements} from '@ionic/pwa-elements/loader';
import {Provider} from 'react-redux';
import {store} from '../store/store';
import {BrowserRouter} from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root-popup'));
root.render(
  <SafeArea
    top
    bottom>
    <Provider store={store}>
      <div style={{height: '600px', width: '400px'}}>
        <BrowserRouter>
          <App isExtension={true} />
        </BrowserRouter>
      </div>
    </Provider>
  </SafeArea>
);

// Enable PWA
defineCustomElements(window);

// Service worker
if (process.env.NODE_ENV === 'production') {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
}
