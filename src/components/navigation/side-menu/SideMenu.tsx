import React, {useState} from 'react';
import {
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonRow,
  IonTitle,
  IonToggle,
  IonToolbar,
} from '@ionic/react';
import {toggleDarkMode} from '../../../theme/helpers/theme-helper';
import murmurImage from '../../../assets/images/ghost-murmur.png';
import {useAppSelector} from '../../../store/hooks';
import {getIsDarkMode, getTheme} from '../../../store/reducers/settings';
const SideMenu = () => {
  const isDarkMode = useAppSelector(getIsDarkMode);
  const [isDark, setIsDark] = useState<boolean>(isDarkMode);

  const handleToggleDark = () => {
    toggleDarkMode();
    setIsDark(isDarkMode);
  };

  return (
    <>
      <IonMenu contentId="main">
        <IonHeader>
          <IonToolbar>
            <IonTitle>
              Murmur{' '}
              <span className="italic text-gray-600 text-sm">{VERSION}</span>
            </IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonContent
          className="ion-padding"
          id="main-content"
          forceOverscroll={false}>
          <IonGrid className="px-0">
            <IonRow className="py-6">
              <IonCol
                size="12"
                className="px-0">
                <IonItem>
                  <img
                    src={murmurImage}
                    alt="Murmur Art"
                    className="w-128 mx-auto shadow-lg rounded-2xl max-w-full h-auto align-middle border-none"
                  />
                </IonItem>
                <IonItem className="mt-2 text-lg justify-center text-center">
                  A Serverless P2P Chat powered by Meerkat
                </IonItem>
              </IonCol>
            </IonRow>
          </IonGrid>
          <IonList lines="none">
            <IonItem>
              <IonLabel>Dark Mode</IonLabel>
              <IonToggle
                onIonChange={(_) => handleToggleDark()}
                checked={isDark}
                slot="end"
              />
            </IonItem>
          </IonList>
        </IonContent>
      </IonMenu>
    </>
  );
};

export default SideMenu;
