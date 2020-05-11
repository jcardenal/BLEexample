import React from 'react';
import { ThemeContext, getTheme, COLOR } from 'react-native-material-ui';
import MainView from './components/MainView'

const uiTheme = {
  palette: {
    primaryColor: COLOR.green400,
  },
};

const App = () => {
  return (
   <ThemeContext.Provider value={getTheme(uiTheme)}>
      <MainView />
   </ThemeContext.Provider>
  );
}


export default App;