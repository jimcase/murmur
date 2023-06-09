import React, {useEffect, useRef, useState} from 'react';
import {
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonNote,
  IonPage,
  IonPopover,
  IonRefresher,
  IonRefresherContent,
  IonRow,
  IonSearchbar,
  IonTitle,
  IonToolbar,
  useIonViewWillEnter,
} from '@ionic/react';
import PageLayout from '../../../layouts/PageLayout';
import {useSideMenuUpdate} from '../../side-menu/SideMenuProvider';
import {people, createOutline, addCircleOutline} from 'ionicons/icons';
import './Chats.scss';
import ChatItem from './ChatItem';
import {handleConnect} from '../../../AppWrapper';
import {useHistory} from 'react-router-dom';
import {subscribe} from '../../../../utils/events';
import {PeerConnect} from '../../../../api/p2p/PeerConnect';
import {HandleConnect} from '../../../../api/p2p/HandleConnect';
import {Messaging} from '../../../../api/background/messaging';
import {getIsExtension} from '../../../../store/reducers/settings';
import {useAppSelector} from '../../../../store/hooks';
import murmurChatsImage from '../../../../assets/images/ghost-chattime.png';
import {METHOD} from '../../../../api/background/config';

const Chats = (props: any) => {
  const pageName = 'Chats';
  const history = useHistory();
  const isExtension = useAppSelector(getIsExtension);

  const {sideMenuOptions} = props;
  const setSideMenu = useSideMenuUpdate();
  const [originalPeers, setOriginalPeers] = useState([]);
  const [results, setResults] = useState([]);
  const [username, setUsername] = useState('');
  const [usernameIsValid, setUsernameIsValid] = useState(undefined);
  const [showEmptyChats, setShowEmptyChats] = useState(false);
  const [showCreateServer, setShowCreateServer] = useState(false);
  const [showJoinServer, setShowJoinServer] = useState(false);
  const [createServerNameInput, setCreateServerNameInput] = useState('');
  const [joinServerNameInput, setJoinServerNameInput] = useState('');
  const [joinServerAddressInput, setJoinServerAddressInput] = useState('');

  const modal = useRef(null);

  const popover = useRef<HTMLIonPopoverElement>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);

  useIonViewWillEnter(() => {
    updateChats();
  });

  useEffect(() => {
    if (props.location?.pathname === '/') {
      setSideMenu({
        options: sideMenuOptions,
        pageName: pageName,
      });
    }
  }, [props.location]);

  const openModal = () => {
    history.push(history.location.pathname + '?modalOpened=true');
  };

  const closeModal = () => {
    setShowJoinServer(false);
    setShowCreateServer(false);
    history.replace('/');
  };

  useEffect(() => {
    // Chrome extension
    chrome?.runtime?.onMessage?.addListener((message) => {
      if (message.type === 'updateChat') {
        updateChats();
      }
    });
  }, []);

  useEffect(() => {
    subscribe('updateChat', () => {
      updateChats();
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      updateChats();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // force re-render after results its updated
  }, [results, showEmptyChats]);

  const updateChats = async () => {
    HandleConnect.getProfile().then((profile) => {
      if (profile.data?.username?.length) {
        setUsername(profile.data.username);
      }
    });

    return HandleConnect.getPeers().then((peers) => {
      let peerList = [];
      if (peers) {
        peerList = peers.map((peer, index: number) => {
          const messages = peer?.messages?.length
            ? peer?.messages.map((message, index: number) => {
                return {
                  ...message,
                  id: index,
                };
              })
            : [];
          return {
            id: index,
            identifier: peer.id,
            key: peer.id,
            name: peer.name,
            contact_id: index,
            preview:
              (messages.length && messages[messages.length - 1].preview) || '',
            messages,
            connected: peer.connected,
            host: false,
          };
        });
      }

      peerList = peerList.filter((peer) => peer.name !== undefined);
      setOriginalPeers(peerList);
      setResults(peerList);

      if (!peerList.length) {
        setShowEmptyChats(true);
      }
      return peerList;
    });
  };
  const handleRefresh = (event) => {
    updateChats();
    setTimeout(() => {
      // Any calls to load data go here
      event.detail.complete();
    }, 1500);
  };
  const search = (e) => {
    const searchTerm = e.target.value;

    if (searchTerm !== '') {
      const searchTermLower = searchTerm.toLowerCase();

      const newResults = results.filter((chat) =>
        results
          .filter((c) => c.id === chat.id)[0]
          .name.toLowerCase()
          .includes(searchTermLower)
      );
      setResults(newResults);
    } else {
      setResults(originalPeers);
    }
  };

  const createNewChannel = async () => {
    const hosts = await HandleConnect.getHosts();

    if (
      !createServerNameInput?.length ||
      (hosts && hosts.some((host) => host.name === createServerNameInput))
    )
      return;

    if (isExtension) {
      Messaging.sendToBackground({
        method: METHOD.createServerP2P,
        data: {serverName: createServerNameInput},
      }).then((response) => {
        updateChats().then(() => closeModal());
      });
    } else {
      handleConnect.createChannel(createServerNameInput);
      updateChats();
    }
  };

  const joinNewChannel = async () => {
    const peers = await HandleConnect.getPeers();
    if (
      (!joinServerNameInput?.length && !joinServerAddressInput?.length) ||
      (peers && peers.some((peer) => peer.name === joinServerNameInput))
    )
      return;

    if (handleConnect) {
      handleConnect.joinChannel(joinServerNameInput, joinServerAddressInput);
      updateChats();
    }

    if (isExtension) {
      Messaging.sendToBackground({
        method: METHOD.joinServerP2P,
        data: {
          serverName: joinServerNameInput,
          serverAddress: joinServerAddressInput,
        },
      }).then((response) => {
        updateChats();
      });
    } else {
      console.log("join channel")
      handleConnect.joinChannel(joinServerNameInput, joinServerAddressInput);
      updateChats();
    }
  };

  function onWillDismiss(ev) {
    closeModal();
  }

  const nameValidator = (text: string) => {
    // Lower and upper case alphanumeric between 2 and 16 characters
    return text.match(/^[a-zA-Z0-9_& -]{2,16}$/);
  };

  const validateUsername = (ev: Event) => {
    const value = (ev.target as HTMLInputElement).value;
    setUsername(value);
    setUsernameIsValid(undefined);

    nameValidator(value) !== null
      ? setUsernameIsValid(true)
      : setUsernameIsValid(false);

    if (
      nameValidator(value) ||
      nameValidator(value) === undefined ||
      value === ''
    ) {
      HandleConnect.setProfile(value).then(() => setUsernameIsValid(true));
    }
  };

  const handleNavigation = (chat) => {
    history.push({
      pathname: `/chat/${chat.key}`,
      search: '', // query string
      state: {
        // location state
        chat,
      },
    });
  };

  return (
    <IonPage id={pageName}>
      <PageLayout
        name={pageName}
        fullscreen={false}
        sideMenu={true}>
        <IonContent>
          <IonHeader>
            <IonToolbar className="ion-text-center">
              <IonItem
                className={`${usernameIsValid && 'ion-valid'} ${
                  usernameIsValid === false && 'ion-invalid'
                }`}>
                <IonLabel
                  position="fixed"
                  className="text-gray-600">
                  Public name:
                </IonLabel>
                <IonInput
                  value={username}
                  onIonInput={(event) => validateUsername(event)}
                  placeholder="Enter your name 💬"
                />
                <IonNote slot="error">Invalid name</IonNote>
              </IonItem>
            </IonToolbar>

            <div className="flex flex-wrap">
              <IonSearchbar
                onIonChange={(e) => search(e)}
                slot="start"
                className="inline-block w-11/12"
              />
              <IonIcon
                className="text-2xl mt-5 cursor-pointer"
                id={`popover-button-chats`}
                icon={addCircleOutline}
                slot="end"
              />
              <IonPopover
                className="scroll-y-hidden"
                trigger={`popover-button-chats`}
                dismissOnSelect={true}
                size={'auto'}
                side="bottom"
                ref={popover}
                isOpen={popoverOpen}
                onDidDismiss={() => setPopoverOpen(false)}>
                <>
                  <IonRow
                    className="cursor-pointer"
                    onClick={() => {
                      setShowCreateServer(true);
                      openModal();
                    }}>
                    <IonItem
                      className="px-4 py-2"
                      style={{background: 'none'}}>
                      <IonIcon
                        slot="start"
                        icon={createOutline}
                      />
                      <IonLabel className="">Create</IonLabel>
                    </IonItem>
                  </IonRow>
                  <IonRow
                    className="cursor-pointer"
                    onClick={() => {
                      setShowJoinServer(true);
                      openModal();
                    }}>
                    <IonItem className="px-4 py-2">
                      <IonIcon
                        slot="start"
                        icon={people}
                      />
                      <IonLabel>Join</IonLabel>
                    </IonItem>
                  </IonRow>
                </>
              </IonPopover>
              <IonModal
                isOpen={showCreateServer}
                ref={modal}
                onWillDismiss={(ev) => onWillDismiss(ev)}
                initialBreakpoint={0.75}
                breakpoints={[0, 0.25, 0.5, 0.75]}>
                <IonHeader>
                  <IonToolbar>
                    <IonTitle>Create Chat</IonTitle>
                  </IonToolbar>
                </IonHeader>
                <IonContent className="ion-padding p-8 px-12">
                  <IonList>
                    <IonLabel
                      class="ion-text-wrap"
                      position="stacked">
                      Create a new p2p channel with WebRTC and WebTorrent
                      trackers.
                    </IonLabel>
                    <IonInput
                      value={createServerNameInput}
                      onIonChange={(e) =>
                        setCreateServerNameInput(e.target.value)
                      }
                      placeholder="Name"
                      type="text"
                      required
                    />
                    <IonButton
                      disabled={!createServerNameInput?.length}
                      expand="block"
                      onClick={() => createNewChannel()}>
                      Create
                    </IonButton>
                  </IonList>
                </IonContent>
              </IonModal>

              <IonModal
                isOpen={showJoinServer}
                ref={modal}
                onWillDismiss={(ev) => onWillDismiss(ev)}
                initialBreakpoint={0.75}
                breakpoints={[0, 0.25, 0.5, 0.75]}>
                <IonHeader>
                  <IonToolbar>
                    <IonTitle>Join</IonTitle>
                  </IonToolbar>
                </IonHeader>
                <IonContent className="ion-padding">
                  <IonList>
                    <IonLabel
                      class="ion-text-wrap"
                      position="stacked">
                      Connect through WebRTC and WebTorrent trackers.
                    </IonLabel>
                    <IonInput
                      value={joinServerNameInput}
                      onIonChange={(e) =>
                        setJoinServerNameInput(e.target.value)
                      }
                      placeholder="Name"
                      type="text"
                      required
                    />
                    <IonInput
                      value={joinServerAddressInput}
                      onIonChange={(e) =>
                        setJoinServerAddressInput(e.target.value)
                      }
                      placeholder="Address"
                      type="text"
                      required
                    />

                    <IonButton
                      disabled={
                        !joinServerNameInput?.length ||
                        !joinServerAddressInput?.length
                      }
                      expand="block"
                      onClick={() => joinNewChannel()}>
                      Join Chat
                    </IonButton>
                  </IonList>
                </IonContent>
              </IonModal>
            </div>
          </IonHeader>

          <IonRefresher
            slot="fixed"
            onIonRefresh={handleRefresh}>
            <IonRefresherContent />
          </IonRefresher>
          {results && results.length ? (
            results.map((chat, index) => {
              return (
                <div
                  key={index}
                  onClick={() => handleNavigation(chat)}>
                  <ChatItem chat={chat} />
                </div>
              );
            })
          ) : (
            <>
              <IonGrid className="px-0">
                <IonRow className="py-6">
                  <IonCol
                    size="12"
                    className="px-0">
                    <IonItem>
                      <img
                        src={murmurChatsImage}
                        alt="Murmur Art"
                        className="px-8 w-128 mx-auto max-w-full h-auto align-middle border-none animate-fade"
                      />
                    </IonItem>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </>
          )}
        </IonContent>
      </PageLayout>
    </IonPage>
  );
};

export default Chats;
