import React from 'react';
import { RadioButtonItem } from '../components/RadioButtonItem';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { omit } from 'lodash';

// Import actions.
import * as settingsActions from '../actions/settingsActions';

export const CurrencySelection = ({ settingsActions, settings }) => {
  const changeLanguageHandler = (currency) => {
    const omitCurrency = omit(currency, ['selected']);
    settingsActions.setCurrency(omitCurrency);
  };
  if (settings.currencies) {
    return settings.currencies.map((el, index) => (
      <RadioButtonItem
        key={index}
        item={el}
        onPress={!el.selected && changeLanguageHandler}
        title={el.currencyCode}
      />
    ));
  }
  return null;
};

export default connect(
  (state) => ({
    settings: state.settings,
  }),
  (dispatch) => ({
    settingsActions: bindActionCreators(settingsActions, dispatch),
  }),
)(CurrencySelection);
