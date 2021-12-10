import React from 'react';
import { View, Text } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

// Components
import Icon from './Icon';

// Links
import i18n from '../utils/i18n';

// Styles
const styles = EStyleSheet.create({
  emptyListContainer: {
    marginTop: '3rem',
    flexDirection: 'column',
    alignItems: 'center',
  },
  emptyListIconWrapper: {
    backgroundColor: '#afb0b3',
    width: '12rem',
    height: '12rem',
    borderRadius: '6rem',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyListIcon: {
    backgroundColor: 'transparent',
    color: '#fff',
    fontSize: '6rem',
  },
  emptyListHeader: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: 'black',
    marginTop: '1rem',
  },
  emptyListDesc: {
    fontSize: '1rem',
    color: '#24282b',
    marginTop: '0.5rem',
  },
});

/**
 * Renders if cart is empty.
 *
 * @return {JSX.Element}
 */
const EmptyCart = () => (
  <View style={styles.emptyListContainer}>
    <View style={styles.emptyListIconWrapper}>
      <Icon name="add-shopping-cart" style={styles.emptyListIcon} />
    </View>
    <Text style={styles.emptyListHeader}>
      {i18n.t('На жаль, Ваш кошик порожнiй')}
    </Text>
    <Text style={styles.emptyListDesc}>{i18n.t('Перейдiть на головну')}</Text>
  </View>
);

export default EmptyCart;
