import React, { Component } from 'react';
import { Provider } from 'react-redux';
import {
  Dimensions,
  AsyncStorage,
  Platform,
  I18nManager,
} from 'react-native';
import { persistStore } from 'redux-persist';
import { Navigation } from 'react-native-navigation';
import EStyleSheet from 'react-native-extended-stylesheet';

import './config';
import store from './store';
import theme from './config/theme';
import registerScreens from './screens';

registerScreens(store, Provider);

// Calcuate styles
const { width } = Dimensions.get('window');
EStyleSheet.build({
  $rem: width > 340 ? 18 : 16,
  // $outline: 1,
  ...theme,
});

class App extends Component {
  constructor(props) {
    super(props);

    // Allow RTL support.
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(true);

    // run app after store persist.
    persistStore(store, {
      blacklist: ['products', 'discussion', 'orders', 'search', 'vendors'],
      storage: AsyncStorage
    }, () => this.startApp());
  }

  startApp = () => {
    Navigation.startSingleScreenApp({
      screen: {
        screen: 'Layouts',
        navigatorStyle: {
          navBarBackgroundColor: theme.$navBarBackgroundColor,
          navBarButtonColor: theme.$navBarButtonColor,
          navBarButtonFontSize: theme.$navBarButtonFontSize,
          navBarTextColor: theme.$navBarTextColor,
          screenBackgroundColor: theme.$screenBackgroundColor,
        },
      },
      appStyle: {
        orientation: 'portrait',
        statusBarColor: theme.$statusBarColor,
      },
      drawer: {
        [I18nManager.isRTL ? 'right' : 'left']: {
          screen: 'Drawer',
        },
        style: {
          drawerShadow: 'NO',
          [I18nManager.isRTL ? 'rightDrawerWidth' : 'leftDrawerWidth']: Platform.OS === 'ios' ? 84 : 100,
          contentOverlayColor: theme.$contentOverlayColor,
        },
      },
    });
  }
}

export default App;
