import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import i18n from '../utils/i18n';
import EStyleSheet from 'react-native-extended-stylesheet';

const styles = EStyleSheet.create({
  addToCartBtnText: {
    textAlign: 'center',
    color: '$buttonWithBackgroundTextColor',
    fontSize: 16,
  },
  addToCartBtn: {
    backgroundColor: '#0f0f0f',
    padding: 10,
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
//менять кнопку доавить в корзину
export const AddToCartButton = ({ onPress, buttonStyle, textStyle }) => {
  return (
    <TouchableOpacity
      style={{ ...styles.addToCartBtn, ...buttonStyle }}
      onPress={onPress}>
      <Text style={{ ...styles.addToCartBtnText, ...textStyle }}>
      {i18n.t('Додати у кошик')}
      </Text>
    </TouchableOpacity>
  );
};

//        {i18n.t('Add to cart').toUpperCase()}   -в 27 лайн