import Meerkat from '@fabianbormann/meerkat';
import {extendMoment} from 'moment-range';
import Moment from 'moment';
import {publish} from '../../utils/events';
import {
  createPluggableStorage,
  PluggableStorage,
} from '../../db/PluggableStorage';

// @ts-ignore
const moment = extendMoment(Moment);

export class PeerConnect {
  private meerkat: Meerkat;
  static table = 'peer';
  id: string;
  apiVersion: string = '0.1.0';
  name: string = 'murmur';
  icon: string = 'data:image/svg+xml,%3Csvg%20xmlns...';

  identity: {address: string; seed: string} = {
    address: '',
    seed: '',
  };

  databaseAPI: PluggableStorage = createPluggableStorage({
    name: 'murmur',
    type: 'pouchdb',
  });

  constructor(
    name: string,
    config: {
      seed: string | undefined;
      identifier: string | undefined;
      announce: string[];
      messages?: string[];
    }
  ) {
    this.name = name;

    this.meerkat = new Meerkat({
      seed: config.seed || undefined,
      identifier: config.identifier,
      //announce: ["https://tracker.boostpool.io"]
      announce: [
        'ws://tracker.files.fm:7072/announce',
        'wss://tracker.openwebtorrent.com/announce',
        'wss://tracker.btorrent.xyz/',
        'https://tracker.boostpool.io',
      ],
    });

    this.id = `${name}:${config.identifier}`;

    this.meerkat.on('server', () => {
      console.log(`[info]: connected to server 💬: ${this.meerkat.identifier}`);
       const db: PluggableStorage = createPluggableStorage({
            name: 'murmur',
            type: 'pouchdb',
        });
      db.get(PeerConnect.table, this.id).then((peer) => {
        db
          .set(PeerConnect.table, this.id, {
            id: this.id,
            seed: peer.data.seed,
            identifier: peer.data.identifier,
            name,
            announce: peer.data.announce,
            messages: peer.data.messages,
            connected: true,
          })
          .then(() => {
            //if (chrome) chrome.runtime?.sendMessage({type: 'updateChat'}); // chrome extension
            publish('updateChat'); // web and mobile
          });
      });
    });

    this.meerkat.register(
      'text_receive',
      (address: string, message: {[key: string]: any}, callback: Function) => {
        try {
          console.log(`[info]: message received: ${JSON.stringify(message)}`);
          console.log(`[info]: transmitted by the server: ${address}`);

          this.databaseAPI.get(PeerConnect.table, this.id).then((p) => {
            const newMessage = {
              preview: message?.message,
              sender: message?.sender,
              self: this.meerkat.peers[message?.sender?.address] === undefined,
              username: message?.username,
              received: true,
              sent: true,
              read: false,
              starred: false,
              date: moment.utc().format('MM-DD HH:mm:ss'),
            };
            this.databaseAPI
              .set(PeerConnect.table, this.id, {
                id: this.id,
                seed: this.meerkat.seed,
                identifier: this.meerkat.identifier,
                name,
                announce: p.data.announce || [],
                messages: p.data.messages?.length
                  ? [...p.data.messages, newMessage]
                  : [newMessage],
                connected: true,
              })
              .then(() => {
                //if (chrome) chrome.runtime?.sendMessage({type: 'updateChat'});
                publish('updateChat');
              });
          });
        } catch (e) {
          callback(false);
        }
      }
    );

    this.databaseAPI
      .set(PeerConnect.table, this.id, {
        id: this.id,
        seed: this.meerkat.seed,
        identifier: this.meerkat.identifier,
        name,
        announce: this.meerkat.announce,
        messages: config.messages,
        connected: false,
      })
      .then(() => {
          console.log(`[info]: Peer stored in db: ${this.id}`);
      });
  }

  /**
   * Send message to host
   *
   * @param identifier - The host identifier to send the message
   * @param peerId - The peer identifier from db
   * @param name - The local channel name
   * @param message - The text message to send
   *
   */
  sendMessage(
    identifier: string,
    message: string,
    username: string = ''
  ): void {
    if (!this.meerkat) return;
    this.meerkat.rpc(
      identifier,
      'text_message',
      {
        message,
        username,
      },
      (response: boolean) => {
        try {
        } catch (e) {}
      }
    );
  }

  /**
   * Ping the server
   *
   * @param identifier - The host identifier to send the message
   * @param peerId - The peer identifier from db
   * @param name - The local channel name
   * @param message - The text message to send
   *
   */
  pingServer(identifier: string, peerId: string, name: string): void {
    if (!this.meerkat) return;

    this.meerkat.rpc(identifier, 'ping_server', {}, (response: boolean) => {
      try {
        this.databaseAPI.get(PeerConnect.table, this.id).then((peer) => {
          this.databaseAPI
            .set(PeerConnect.table, this.id, {
              id: this.id,
              seed: this.meerkat.seed,
              identifier: this.meerkat.identifier,
              name,
              announce: peer?.announce || [],
              messages: peer?.messages || [],
              connected: response,
            })
            .then(() => {
              //if (chrome) chrome.runtime?.sendMessage({type: 'updateChat'});
              publish('updateChat');
            });
        });
      } catch (e) {}
    });
  }
}
