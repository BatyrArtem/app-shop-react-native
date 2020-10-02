import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import * as t from 'tcomb-form-native';

import i18n from '../utils/i18n';

const styles = EStyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 14,
  },
});

const Form = t.form.Form;
const formFields = t.struct({});
const formOptions = {};

/**
 * Renders payment yandex kassa form.
 *
 * @param {function} onInit - Determines which form should be rendered.
 *
 * @return {JSX.Element}
 */
export default class PaymentYandexKassaForm extends Component {
  /**
   * @ignore
   */
  static propTypes = {
    onInit: PropTypes.func,
  };

  componentDidMount() {
    this.props.onInit(this.refs.formRef);
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>{i18n.t('Yandex Kassa')}</Text>
        <Form
          ref={'formRef'}
          type={formFields}
          options={formOptions}
        />
      </View>
    );
  }
}
