import React, {useEffect, createContext} from 'react';
import {NativeEventEmitter, NativeModules, BackHandler} from 'react-native';
import { ThemeContext, getTheme, COLOR } from 'react-native-material-ui';
import MainView from './components/MainView';
import BleManager from 'react-native-ble-manager';
import * as Permissions from 'expo-permissions';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

export const EmitterContext = createContext(bleManagerEmitter)

const uiTheme = {
  palette: {
    primaryColor: COLOR.green400,
  },
};

const App = ({emitter}) => {

  useEffect(() => {BleManager.start()
                        .then(() => {
                            console.log('BLE support module initialized');
                            BleManager.enableBluetooth()
                              .then(async () => {
                                console.log('The bluetooth is already enabled or the user confirmed');
                                const { status, permissions } = await Permissions.askAsync(Permissions.LOCATION);
                                  if (status === 'granted') {
                                    console.log('The LOCATION permission is granted');
                                  } else {
                                    console.log('LOCATION permission not granted. Exiting...');
                                    BackHandler.exitApp();
                                  }
                              })
                              .catch((error) => {
                                console.log('The user refuses to enable bluetooth. Exiting ...');
                                BackHandler.exitApp();
                              });
                           });
                   }, []);


  return (
      <EmitterContext.Provider value={emitter}>
           <ThemeContext.Provider value={getTheme(uiTheme)}>
              <MainView />
           </ThemeContext.Provider>
       </EmitterContext.Provider>
  );
}

App.defaultProps = {
    emitter: bleManagerEmitter,
}

export default App;