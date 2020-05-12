import React, {useEffect} from 'react';
import {NativeEventEmitter, NativeModules} from 'react-native';
import { ThemeContext, getTheme, COLOR } from 'react-native-material-ui';
import MainView from './components/MainView';
import BleManager from 'react-native-ble-manager';

const BleManagerModule = NativeModules.BleManager;
export const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const uiTheme = {
  palette: {
    primaryColor: COLOR.green400,
  },
};

const App = () => {

  useEffect(() => {BleManager.start()
                        .then(() => {
                             // Success code
                             console.log('BLE support module initialized');
                           });
                   }, []);

  console.log("bleManagerEmitter", bleManagerEmitter);
  bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', () => {});

  return (
   <ThemeContext.Provider value={getTheme(uiTheme)}>
      <MainView />
   </ThemeContext.Provider>
  );
}


export default App;