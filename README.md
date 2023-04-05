# Murmur 

![Murmur](./public/murmur-header.png)

Murmur is an app that allows you to chat securely without relying on a centralized server. Powered by Meerkat that is based on Torrent technology, the extension discovers and connects users directly without the need for intermediaries. This means that your messages are private and not stored anywhere, just in your local machine.

Meerkat is an open-source technology designed to facilitate secure and private P2P communication. This extension is a reference implementation of Meerkat that utilizes its features to ensure reliable connections between peers.
The app is free and open-source, meaning anyone can contribute to its development and improve its security and UX. In fact, we believe that our extension can serve as an example for other cases of use and implementations. By making our code open to the community, we hope to inspire others to build upon our work and create new and innovative applications that utilize the Meerkat technology.

Inspired by the Cardano Community.

### P2P with Meerkat
Reference implementation of [Meerkat](https://github.com/fabianbormann/meerkat)

## Usage
```bash
    nvm use 16.10.0
    npm i
```

Incase of fatal error: 'vips/vips8' file not found:

```bash
    brew info vips
```

```bash
    brew reinstall vips
    brew install pkg-config glib zlib
    brew install libjpeg-turbo libpng webp
```

#### Web
```bash
     npm run dev
     npm run build
```

#### Mobile
```bash
    brew install cocoapods
    npm run build:cap
```

Finally, run the app:

```
    npm run open:ios
    npm run open:android
```

Or open Android Studio:

```
    npx cap open android
```


#### Chromium Extension
```bash
   npm run build:extension
```
Currently only supports manifest V2, since version 3 does not persist the service worker.
