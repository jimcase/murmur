import React, {useEffect, useRef, useState} from 'react';
import {
  IonBackButton,
  IonCheckbox,
  IonCol,
  IonContent,
  IonFooter,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonModal,
  IonPage,
  IonPopover,
  IonRefresher,
  IonRefresherContent,
  IonRow,
  IonText,
  IonTextarea,
  IonTitle,
  IonToast,
  IonToolbar,
  useIonViewWillEnter,
} from '@ionic/react';
import {
  send,
  qrCodeOutline,
  trashOutline,
  wifiOutline,
  copyOutline,
  ellipsisVertical,
  refreshCircleSharp,
} from 'ionicons/icons';

import {useParams} from 'react-router';
import './Chat.css';
import {ChatBottomDetails} from './ChatBottomDetails';
import {ChatRepliedQuote} from './ChatRepliedQuote';

import {writeToClipboard} from '../../../../utils/clipboard';
import {useHistory, useLocation} from 'react-router-dom';
import {addressSlice} from '../../../../utils/utils';
import {handleConnect} from '../../../AppWrapper';
import {subscribe} from '../../../../utils/events';
import {HandleConnect} from '../../../../api/p2p/HandleConnect';
import {PeerConnect} from '../../../../api/p2p/PeerConnect';
import {QRCode} from 'react-qrcode-logo';
import { Messaging } from '../../../../api/background/messaging';
import {METHOD} from '../../../../api/background/config';
import { useAppSelector } from '../../../../store/hooks';
import { getIsExtension } from '../../../../store/reducers/settings';


const Chat = () => {
  const params = useParams();
  const location = useLocation();
  const history = useHistory();

  const isExtension = useAppSelector(getIsExtension);

  //  Local state
  const [chat, setChat] = useState(location?.state?.chat || {});

  const [message, setMessage] = useState('');

  const [showFooter, setShowFooter] = useState(true);
  const [showQrCode, setShowQrCode] = useState(false);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState('success');

  //  Refs
  const contentRef = useRef();
  const modal = useRef(null);

  const popover = useRef<HTMLIonPopoverElement>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);

  useEffect(() => {
    updateChat();
  }, []);

  useEffect(() => {
    subscribe('updateChat', () => {
      updateChat();
    });
    subscribe('ionBackButton', () => {
      setShowFooter(false);
      history.goBack();
    });
  }, []);

  const updateChat = async () => {
    if (!params) return;
    const chat = await HandleConnect.getPeer(PeerConnect.table, params.chat_id);
    if (chat.success) setChat(chat.data);
  };
  const pingChat = async () => {
    if (!params) return;
    const name = params.chat_id.split(':')[0];
    const identifier = params.chat_id.split(':')[1];
    handleConnect.pingServer(identifier, `peer:${params.chat_id}`, name);
  };

  //  Scroll to end of content
  useIonViewWillEnter(() => {
    scrollToBottom();
  });

  //  Scroll to end of content
  const scrollToBottom = async () => {
    contentRef.current.scrollToBottom();
  };

  useEffect(() => {
    const updateState = setTimeout(() => {
      updateChat();
    }, 1500);
    return () => clearInterval(updateState);
  }, []);

  const removeChat = async () => {
    await HandleConnect.removePeer(chat.id);
    await HandleConnect.removeHost(chat.id);

    history.goBack();
  };
  const sendMessage = async () => {
    if (message !== '') {
      try {
        const identifier = params.chat_id.split(':')[1];

        const profile = await HandleConnect.getProfile();

        if (isExtension) {
          Messaging.sendToBackground({
            method: METHOD.sendMessageP2P,
            data: {
              identifier,
              serverAddress: params.chat_id,
              message,
              username: profile.success ? profile.data.username : ''
            },
          }).then((response) => {

          });
        } else {
          // TODO: flag extension or web/mobile
          handleConnect.sendMessage(
              identifier,
              params.chat_id,
              message,
              profile.success ? profile.data.username : ''
          );
        }
        setMessage('');
        setTimeout(() => updateChat().then(() => scrollToBottom()), 200);

      } catch (e) {
        setToastMessage(`Error: ${e}`);
        setToastColor('danger');
        setShowToast(true);
      }
    }
  };

  const onCopy = (content) => {
    writeToClipboard(content).then(() => {
      setToastColor('success');
      setToastMessage(`Copied: ${content}`);
      setShowToast(true);
    });
  };

  const handleRefresh = (event) => {
    updateChat();
    setTimeout(() => {
      // Any calls to load data go here
      event.detail.complete();
    }, 100);
  };

  const onWillDismiss = (ev) => {
    closeModal();
  };

  const closeModal = () => {
    setShowQrCode(false);
    history.goBack();
  };

  const openModal = () => {
    history.push(history.location.pathname + '?modalOpened=true');
  };

  return (
    <IonPage className="">
      <IonHeader>
        <IonToolbar>
          <IonBackButton
            defaultHref={'/'}
            onClick={() => {
              setShowFooter(false);
              history.goBack();
            }}
            slot="start"
          />
          <IonTitle>
            <div className="chat-contact ">
              <img
                src={'https://via.placeholder.com/150'}
                alt="avatar"
              />
              <div className="chat-contact-details">
                <p>
                  {chat?.name}
                  <span
                    className="ml-3 color animate-fade"
                    onClick={() => pingChat()}>
                    {chat?.connected ? (
                      <IonIcon
                        size="small"
                        icon={wifiOutline}
                        color="success"
                      />
                    ) : (
                      <IonIcon
                        size="small"
                        icon={wifiOutline}
                        color="gray"
                      />
                    )}
                  </span>
                </p>
                <IonText
                  color="medium cursor-pointer"
                  onClick={() => onCopy(chat?.identifier)}>
                  {addressSlice(chat?.identifier, 15)}
                </IonText>
              </div>
            </div>
          </IonTitle>
          <div className="ion-text-end">
            <IonIcon
              className="text-2xl mt-2"
              id={`popover-button-chat`}
              icon={ellipsisVertical}
              slot="end"
            />
            <IonPopover
              className="scroll-y-hidden"
              trigger={`popover-button-chat`}
              dismissOnSelect={true}
              size={'auto'}
              side="bottom"
              ref={popover}
              isOpen={popoverOpen}
              onDidDismiss={() => setPopoverOpen(false)}>
              <>
                <IonRow>
                  <IonItem
                    className="px-4 py-2"
                    onClick={() => updateChat()}>
                    <IonIcon
                      slot="start"
                      icon={refreshCircleSharp}
                    />
                    <IonLabel> Update</IonLabel>
                  </IonItem>
                </IonRow>
                <IonRow>
                  <IonItem
                    className="px-4 py-2"
                    onClick={() => onCopy(chat?.identifier)}>
                    <IonIcon
                      slot="start"
                      icon={copyOutline}
                    />
                    <IonLabel> Copy ID</IonLabel>
                  </IonItem>
                </IonRow>
                <IonRow>
                  <IonItem className="px-4 py-2">
                    <IonIcon
                      slot="start"
                      icon={qrCodeOutline}
                    />
                    <IonLabel
                      onClick={() => {
                        setShowQrCode(true);
                        openModal();
                      }}>
                      QR Code
                    </IonLabel>
                  </IonItem>
                </IonRow>
                <IonRow>
                  <IonItem className="px-4 py-2">
                    <IonIcon
                      slot="start"
                      icon={trashOutline}
                    />
                    <IonLabel onClick={() => removeChat()}>Delete</IonLabel>
                  </IonItem>
                </IonRow>
              </>
            </IonPopover>
            <IonModal
              isOpen={showQrCode}
              ref={modal}
              trigger="open-create-chat"
              onWillDismiss={(ev) => onWillDismiss(ev)}>
              <IonContent className="ion-padding">
                <div className="flex flex-col text-center w-full items-center">
                  <QRCode
                    value={params.chat_id.split(':')[1]}
                    size={250}
                    fgColor={'black'}
                    bgColor={'#FFFFFF'}
                    qrStyle={'squares'}
                    logoImage={
                      'https://webisora.com/wp-content/uploads/2017/09/WebisoraLogo_B.png'
                    }
                    logoWidth={180}
                    logoHeight={40}
                    logoOpacity={1}
                    quietZon={10} //The size of the quiet zone around the QR Code. This will have the same color as QR Code bgColor
                  />
                  <p className="my-2 text-xl font-bold">Scan Chat ID</p>
                </div>
              </IonContent>
            </IonModal>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent
        id="main-chat-content"
        ref={contentRef}>
        {chat &&
          Object.keys(chat).length &&
          chat?.messages?.map((message, index) => {
            /*
          const repliedMessage = chat.filter(
            (subMessage) =>
              parseInt(subMessage.id) === parseInt(message.replyID)
          )[0];
          */
            return (
              <div
                id={`chatBubble_${index}`}
                key={index}
                className={`chat-bubble animate-fade ${
                  message.self
                    ? 'bubble-sent bg-gray-500'
                    : 'bubble-received bg-green-700'
                }`}>
                {message?.sender ? (
                  <div
                    className={`mr-2 ${
                      message.self ? 'chat-bottom-details' : ''
                    }`}>
                    <span
                      onClick={() => onCopy(message.sender.address)}
                      className={`cursor-pointer text-sm rounded p-1 text-white opacity-75 bg-${
                        message.self ? 'green' : 'gray'
                      }-400`}>
                      {message.username?.length
                        ? `@${message.username}`
                        : addressSlice(message.sender.address, 2)}
                    </span>
                  </div>
                ) : null}
                <div
                  id={`chatText_${index}`}
                  className="text-white">
                  <ChatRepliedQuote
                    message={message?.preview}
                    contact={null}
                    //repliedMessage={repliedMessage}
                  />
                  {message?.preview}
                  <ChatBottomDetails message={message} />
                </div>

                <div className={`bubble-arrow ${message.self && 'alt'}`}></div>
              </div>
            );
          })}
        <IonRefresher
          slot="fixed"
          onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <IonToast
          color={toastColor}
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          position="bottom"
          duration="3000"
        />
      </IonContent>

      {showFooter ? (
        <IonFooter
          className="chat-footer animate-fadeOut "
          id="chat-footer">
          <IonGrid>
            <IonRow className="ion-align-items-center">
              <IonItem color="transparent">
                <IonCheckbox
                  disabled={true}
                  slot="start"></IonCheckbox>
              </IonItem>
              <div className="chat-input-container">
                <IonTextarea
                  rows="1"
                  disabled={!chat?.connected}
                  value={message}
                  onIonChange={(e) => setMessage(e.target.value)}
                />
              </div>
              <IonCol
                size="1"
                className="chat-send-button"
                onClick={sendMessage}>
                <IonIcon icon={send} />
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonFooter>
      ) : null}
    </IonPage>
  );
};

export default Chat;
