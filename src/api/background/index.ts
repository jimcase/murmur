//import { HandleConnect } from '../p2p/HandleConnect';
import {PouchStorage} from '../../db/pouchStorage';
import {METHOD} from '../background/config';
import {HandleConnect} from '../p2p/HandleConnect';
import {Messaging} from './messaging';
const app = Messaging.createBackgroundController();

let handleConnectBackground: HandleConnect | undefined = undefined;

app.add('example-bg', async (request, sendResponse) => {
  /*
  console.log('this a bg example!');
  console.log(request);

  const db =  new PouchStorage("example.db");

  const r = await db.get("Accoount", "1");
  console.log("result");
  console.log(r);

  console.log("let set on db");
  db.set("Accoount", "1", {data: "hello world 1", num: 1});

  */
  sendResponse({
    // @ts-ignore
    id: 'Send message done',
    target: 'murmur',
    sender: 'extension',
  });
});

app.add(METHOD.initHandleConnect, async (request, sendResponse) => {
  try {
    if (handleConnectBackground === undefined) {
      handleConnectBackground = new HandleConnect();
    }

    sendResponse({
      success: true,
    });
  } catch (error) {
    sendResponse({
      success: false,
      error,
    });
  }
});

app.add(METHOD.createServerP2P, async (request, sendResponse) => {
  try {
    handleConnectBackground.createChannel(request.data.serverName);
    sendResponse({
      success: true,
    });
  } catch (error) {
    sendResponse({
      success: false,
      error,
    });
  }
});

app.add(METHOD.sendMessageP2P, async (request, sendResponse) => {
  try {
    handleConnectBackground.sendMessage(
        request.data.identifier,
        request.data.serverAddress,
        request.data.message,
        request.data.username);
    sendResponse({
      success: true,
    });
  } catch (error) {
    sendResponse({
      success: false,
      error,
    });
  }
});

app.listen();

