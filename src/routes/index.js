import React from 'react';
import {IonRouterOutlet, IonSplitPane} from '@ionic/react';
import {IonReactRouter} from '@ionic/react-router';
import {Route} from 'react-router-dom';
import SideMenu from '../components/navigation/side-menu/SideMenu';
import Chat from '../components/navigation/tab-menu/Chat/Chat';
import Chats from '../components/navigation/tab-menu/Chat/Chats';

const Routes = () => {
  return (
    <IonReactRouter>
      <IonSplitPane contentId="main">
        <SideMenu />
        <IonRouterOutlet id="main">
          <Route
            exact
            path="/"
            render={() => <Chats />}
          />
          <Route
            path="/chat/:chat_id?"
            render={() => <Chat />}
          />
        </IonRouterOutlet>
      </IonSplitPane>
    </IonReactRouter>
  );
};

export default Routes;
