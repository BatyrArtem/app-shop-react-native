import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

import Button from './Button';
import i18n from '../utils/i18n';
import { formatPrice } from '../utils';

/**
 * Футер корзины
 */

/**
 * props:
 * totalPrice - общая сумма заказа
 * btnText - текст на кнопке футера
 * onBtnPress - функция нажатия
 * isBtnDisabled - определяет доступность нажатия
 */

const styles = EStyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F1F1F1',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
  },
  cartInfoTitle: {
    color: '#979797',
  },
  cartInfoTotal: {
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#FD542A',
  },
});

export default class extends PureComponent {
  static propTypes = {
    totalPrice: PropTypes.string,
    btnText: PropTypes.string,
    onBtnPress: PropTypes.func,
    isBtnDisabled: PropTypes.bool,
  };

  render() {
    const {
      onBtnPress,
      totalPrice,
      isBtnDisabled,
      btnText,
    } = this.props;
    return (
      <View style={styles.container}>
        <View>
          <Text style={styles.cartInfoTitle}>
            {i18n.t('Total').toUpperCase()}
          </Text>
          <Text style={styles.cartInfoTotal}>
            {formatPrice(totalPrice)}
          </Text>
        </View>
        <Button
          type="primary"
          onPress={() => onBtnPress()}
          disabled={isBtnDisabled}
        >
          <Text style={styles.placeOrderBtnText}>
            {btnText}
          </Text>
        </Button>
      </View>
    );
  }
}
