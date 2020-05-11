import React, {useEffect} from 'react';
import { ThemeContext, getTheme, COLOR } from 'react-native-material-ui';
import MainView from './components/MainView';
import BleManager from 'react-native-ble-manager';

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

  return (
   <ThemeContext.Provider value={getTheme(uiTheme)}>
      <MainView />
   </ThemeContext.Provider>
  );
}


export default App;