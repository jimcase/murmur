import React from 'react';
import {IonApp, setupIonicReact} from '@ionic/react';
import {useEffect} from 'react';
import Routes from './routes';
import {SideMenuProvider} from './components/navigation/side-menu/SideMenuProvider';
/* Core CSS required for Ionic components to work properly */
import './theme/tailwind.css';
import './theme/ionic.scss';
import './theme/style.scss';
import './theme/structure.css';
import AppWrapper from './components/AppWrapper';
import {SplashScreen} from '@capacitor/splash-screen';

setupIonicReact({
  swipeBackEnabled: false,
});

const App = (isExtension?: boolean) => {
  useEffect(() => {
    SplashScreen.show({
      showDuration: 2000,
      fadeInDuration: 0,
      fadeOutDuration: 0.5,
      autoHide: true,
    });
  }, []);

  return (
    <IonApp>
      <AppWrapper isExtension={isExtension}>
        <SideMenuProvider>
          <Routes />
        </SideMenuProvider>
      </AppWrapper>
    </IonApp>
  );
};

export default App;
