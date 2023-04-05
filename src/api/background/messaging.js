import {METHOD, SENDER, TARGET} from './config';
import {Browser} from '@capacitor/browser';

/**
 * Message Object
 * {
 *  ?method: METHOD,
 *  ?data: DATA,
 *  ?error: ERROR,
 *  sender: SENDER (extension || webpage),
 *  target: TARGET,
 *  ?id: requestId,
 *  ?origin: window.origin
 *  ?event: EVENT
 * }
 */

class BackgroundController {
  constructor() {
    /**
     * @private
     */
    this._methodList = {};
  }

  /**
   * @callback methodCallback
   * @param {object} request
   * @param {function} sendResponse
   */
  /**

  /**
   * @param {string} method
   * @param {methodCallback} func
   */
  add = (method, func) => {
    this._methodList[method] = func;
  };

  listen = () => {
    try {
      chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
        if (request.sender === SENDER.webpage) {
          this._methodList[request.method](request, sendResponse);
        }
        return true;
      });
    } catch (e) {}
  };
}

export const Messaging = {
  sendToBackground: async function (request) {
    return new Promise((res, rej) =>
      chrome.runtime.sendMessage(
        {...request, target: TARGET, sender: SENDER.webpage},
        (response) => res(response)
      )
    );
  },
  createBackgroundController: () => new BackgroundController(),
};
