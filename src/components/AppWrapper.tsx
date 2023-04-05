import React, {useEffect, useState} from 'react';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {CacheAPI} from '../models/Cache/CacheAPI';
import {SettingsAPI} from '../models/Settings/SettingsAPI';
import {setCache} from '../store/reducers/cache';
import {
  getIsExtension,
  setIsDarkMode,
  setIsExtension,
} from '../store/reducers/settings';
import {setDarkMode} from '../theme/helpers/theme-helper';
import {HandleConnect} from '../api/p2p/HandleConnect';
import {createPluggableStorage, PluggableStorage} from '../db/PluggableStorage';
import {useHistory} from 'react-router-dom';
import {Messaging} from '../api/background/messaging';
import {METHOD} from '../api/background/config';
import {Address, BaseAddress } from '@dcspark/cardano-multiplatform-lib-browser';

export let handleConnect: HandleConnect | undefined = undefined;

const AppWrapper = (props: {children: any; isExtension?: boolean}) => {
  const dispatch = useAppDispatch();
  const isExtension = useAppSelector(getIsExtension);

  const [child, setChild] = useState(null);

  const history = useHistory();
  // TODO: hotfix, refactor extension webpack
  if (props.isExtension && history) {
    history.push('/');
  }

  useEffect(() => {
    initApp().then(() => {
      renderChild();
    });
  }, []);

  const initApp = async () => {
    await CacheAPI.init();
    dispatch(setCache(CacheAPI.get()));

    if (props.isExtension.isExtension) {  // TODO: refactor
      Messaging.sendToBackground({
        method: METHOD.initHandleConnect,
        data: {},
      });
    } else {
      handleConnect = new HandleConnect();
    }

    dispatch(setIsExtension(props.isExtension));

    await SettingsAPI.init();
    await SettingsAPI.commit();

    const body = document.querySelector('body');
    if (body) body.setAttribute('theme-color', 'contrast');
    const isDarkMode = SettingsAPI.getIsDarkMode();
    setDarkMode(isDarkMode);
    dispatch(setIsDarkMode({isDarkMode}));
  };

  const renderChild = () => {
    setChild(props.children);
  };

  return <div id="appWrapper">{child ? child : null}</div>;
};

export default AppWrapper;
