import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import * as t from 'tcomb-form-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

// Import components
import CheckoutSteps from '../components/CheckoutSteps';
import FormBlockField from '../components/FormBlockField';
import FormBlock from '../components/FormBlock';
import CartFooter from '../components/CartFooter';

// Import actions.
import * as authActions from '../actions/authActions';
import * as cartActions from '../actions/cartActions';

import i18n from '../utils/i18n';
import { getCountries, getStates, formatPrice } from '../utils';

// theme
import theme from '../config/theme';

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  contentContainer: {
    padding: 14,
  },
});

const cachedCountries = getCountries();
const Form = t.form.Form;
const Country = t.enums(cachedCountries);

const billingFields = {
  b_firstname: t.String,
  b_lastname: t.String,
  email: t.String,
  b_phone: t.maybe(t.String),
  b_address: t.String,
  b_address_2: t.maybe(t.String),
  b_city: t.String,
  b_country: Country,
  b_state: t.String,
  b_zipcode: t.String,
};
const BillingOptions = {
  disableOrder: true,
  fields: {
    b_firstname: {
      label: i18n.gettext('First name'),
      returnKeyType: 'done',
      clearButtonMode: 'while-editing',
    },
    b_lastname: {
      label: i18n.gettext('Last name'),
      returnKeyType: 'done',
      clearButtonMode: 'while-editing',
    },
    email: {
      label: i18n.gettext('Email'),
      keyboardType: 'email-address',
      returnKeyType: 'done',
      clearButtonMode: 'while-editing',
    },
    b_phone: {
      label: i18n.gettext('Phone'),
      keyboardType: 'phone-pad',
      returnKeyType: 'done',
      clearButtonMode: 'while-editing',
      i18n: {
        optional: '',
        required: '',
      },
      help: `${i18n.gettext('(Optional)')}`,
    },
    b_address: {
      label: i18n.gettext('Address'),
      multiline: true,
      numberOfLines: 4,
      clearButtonMode: 'while-editing',
      returnKeyType: 'done',
    },
    b_address_2: {
      label: i18n.gettext('Address 2'),
      multiline: true,
      numberOfLines: 4,
      clearButtonMode: 'while-editing',
      returnKeyType: 'done',
      i18n: {
        optional: '',
        required: '',
      },
      help: `${i18n.gettext('(Optional)')}`,
    },
    b_city: {
      label: i18n.gettext('City'),
      returnKeyType: 'done',
      clearButtonMode: 'while-editing',
    },
    b_country: {
      label: i18n.gettext('Country'),
      nullOption: {
        value: '',
        text: i18n.gettext('Select country')
      },
    },
    b_state: {
      label: i18n.gettext('State'),
      nullOption: {
        value: '',
        text: i18n.gettext('Select state')
      },
    },
    b_zipcode: {
      label: i18n.gettext('Zip code'),
      keyboardType: 'numeric',
      returnKeyType: 'done',
      clearButtonMode: 'while-editing',
    },
  }
};

const shippingFields = {
  s_firstname: t.String,
  s_lastname: t.String,
  email: t.String,
  s_phone: t.maybe(t.String),
  s_address: t.String,
  s_address_2: t.maybe(t.String),
  s_city: t.String,
  s_country: Country,
  s_state: t.String,
  s_zipcode: t.String,
};
const ShippingOptions = {
  disableOrder: true,
  fields: {
    s_firstname: {
      label: i18n.gettext('First name'),
      returnKeyType: 'done',
      clearButtonMode: 'while-editing',
    },
    s_lastname: {
      label: i18n.gettext('Last name'),
      returnKeyType: 'done',
      clearButtonMode: 'while-editing',
    },
    email: {
      label: i18n.gettext('Email'),
      keyboardType: 'email-address',
      returnKeyType: 'done',
      clearButtonMode: 'while-editing',
    },
    s_phone: {
      label: i18n.gettext('Phone'),
      keyboardType: 'phone-pad',
      returnKeyType: 'done',
      clearButtonMode: 'while-editing',
      i18n: {
        optional: '',
        required: '',
      },
      help: `${i18n.gettext('(Optional)')}`,
    },
    s_address: {
      label: i18n.gettext('Address'),
      multiline: true,
      numberOfLines: 4,
      clearButtonMode: 'while-editing',
      returnKeyType: 'done',
    },
    s_address_2: {
      label: i18n.gettext('Address 2'),
      multiline: true,
      numberOfLines: 4,
      clearButtonMode: 'while-editing',
      returnKeyType: 'done',
      i18n: {
        optional: '',
        required: '',
      },
      help: `${i18n.gettext('(Optional)')}`,
    },
    s_city: {
      label: i18n.gettext('City'),
      returnKeyType: 'done',
      clearButtonMode: 'while-editing',
    },
    s_country: {
      label: i18n.gettext('Country'),
      nullOption: {
        value: '',
        text: i18n.gettext('Select country')
      },
    },
    s_state: {
      label: i18n.gettext('State'),
      nullOption: {
        value: '',
        text: i18n.gettext('Select state')
      },
    },
    s_zipcode: {
      label: i18n.gettext('Zip code'),
      keyboardType: 'numeric',
      returnKeyType: 'done',
      clearButtonMode: 'while-editing',
    },
  }
};

class Checkout extends Component {
  static navigatorStyle = {
    navBarBackgroundColor: theme.$navBarBackgroundColor,
    navBarButtonColor: theme.$navBarButtonColor,
    navBarButtonFontSize: theme.$navBarButtonFontSize,
    navBarTextColor: theme.$navBarTextColor,
    screenBackgroundColor: theme.$screenBackgroundColor,
  };

  static propTypes = {
    navigator: PropTypes.shape({
      push: PropTypes.func,
      pop: PropTypes.func,
      setOnNavigatorEvent: PropTypes.func,
    }),
    cart: PropTypes.shape(),
  };

  constructor(props) {
    super(props);
    this.isFirstLoad = true;
    this.state = {
      isShippingChanged: false,
      billingFormFields: t.struct({
        ...billingFields,
      }),
      shippingFormFields: t.struct({
        ...shippingFields,
      }),
      billingValues: {},
      shippingValues: {},
    };
    props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

  componentDidMount() {
    const { navigator, cart: { user_data, default_location } } = this.props;

    navigator.setTitle({
      title: i18n.gettext('Checkout').toUpperCase(),
    });

    let defaults = default_location;
    if (!defaults) {
      defaults = {
        phone: '',
        address: '',
        city: '',
        country: '',
        state: '',
        zipcode: '',
      };
    }

    this.setState({
      billingValues: {
        b_firstname: user_data.b_firstname,
        b_lastname: user_data.b_lastname,
        email: user_data.email,
        b_phone: user_data.b_phone || defaults.phone,
        b_address: user_data.b_address || defaults.address,
        b_address_2: user_data.b_address_2,
        b_city: user_data.b_city || defaults.city,
        b_country: user_data.b_country || defaults.country,
        b_state: user_data.b_state || defaults.state,
        b_zipcode: user_data.b_zipcode || defaults.zipcode,
      },
      shippingValues: {
        s_firstname: user_data.s_firstname,
        s_lastname: user_data.s_lastname,
        email: user_data.email,
        s_phone: user_data.s_phone || defaults.phone,
        s_address: user_data.s_address || defaults.address,
        s_address_2: user_data.s_address_2,
        s_city: user_data.s_city || defaults.city,
        s_country: user_data.s_country || defaults.country,
        s_state: user_data.s_state || defaults.state,
        s_zipcode: user_data.s_zipcode || defaults.zipcode,
      },
    }, () => {
      if (this.isFirstLoad) {
        this.isFirstLoad = false;
        this.handleChange(this.state.billingValues, 'billing');
        this.handleChange(this.state.shippingValues, 'shipping');
      }
    });
  }

  onNavigatorEvent(event) {
    const { navigator } = this.props;
    if (event.type === 'NavBarButtonPress') {
      if (event.id === 'back') {
        navigator.pop();
      }
    }
  }

  handleChange = (value, type) => {
    if (type === 'billing') {
      const bState = getStates(value.b_country);
      if (bState) {
        this.setState({
          billingFormFields: t.struct({
            ...billingFields,
            b_state: t.enums(bState),
          }),
          billingValues: {
            ...value,
            b_state: (bState[value.b_state] !== undefined) ? value.b_state : '',
          },
        });
      } else {
        this.setState({
          billingFormFields: t.struct({
            ...billingFields,
          }),
          billingValues: {
            ...value,
            b_state: ''
          }
        });
      }
    } else if (type === 'shipping') {
      const sState = getStates(value.s_country);
      this.isShippingChanged = true;
      if (sState) {
        this.setState({
          shippingFormFields: t.struct({
            ...shippingFields,
            s_state: t.enums(sState),
          }),
          shippingValues: {
            ...value,
            s_state: (sState[value.s_state] !== undefined) ? value.s_state : '',
          },
        });
      } else {
        this.setState({
          shippingFormFields: t.struct({
            ...shippingFields,
          }),
          shippingValues: {
            ...value,
            s_state: ''
          }
        });
      }
    }
  }

  handleNextPress() {
    const { isShippingChanged } = this.state;
    const { navigator, cart, cartActions } = this.props;
    let shippingForm = {};
    const billingForm = this.refs.checkoutBilling.getValue(); // eslint-disable-line

    if ('checkoutShipping' in this.refs) {  // eslint-disable-line
      shippingForm = this.refs.checkoutShipping.getValue();  // eslint-disable-line
    }

    if (billingForm && shippingForm) {
      if (!isShippingChanged) {
        shippingForm = {
          s_firstname: billingForm.b_firstname,
          s_lastname: billingForm.b_lastname,
          s_address: billingForm.b_address,
          s_address_2: billingForm.b_address_2,
          s_city: billingForm.b_city,
          s_country: billingForm.b_country,
          s_state: billingForm.b_state,
          s_zipcode: billingForm.b_zipcode,
        };
      }
      cartActions.saveUserData({
        ...cart.user_data,
        ...billingForm,
        ...shippingForm,
      });
      navigator.push({
        screen: 'CheckoutShipping',
        backButtonTitle: '',
        title: i18n.gettext('Checkout').toUpperCase(),
        passProps: {
          total: cart.subtotal,
        },
      });
    }
  }

  render() {
    const { cart } = this.props;
    const {
      billingFormFields,
      billingValues,
      shippingValues,
      shippingFormFields,
    } = this.state;
    return (
      <View style={styles.container}>
        <KeyboardAwareScrollView
          contentContainerStyle={styles.contentContainer}
        >
          <CheckoutSteps step={1} />
          <FormBlock
            title={i18n.gettext('Billing address')}
          >
            <Form
              ref="checkoutBilling"  // eslint-disable-line
              type={billingFormFields}
              value={billingValues}
              onChange={values => this.handleChange(values, 'billing')}
              options={BillingOptions}
            />
          </FormBlock>

          <FormBlock
            title={i18n.gettext('Shipping address')}
            buttonText={i18n.gettext('Change address')}
            onShowMorePress={() => this.setState({ isShippingChanged: true })}
            simpleView={(
              <View>
                <FormBlockField title={`${i18n.gettext('First name')}:`}>
                  {shippingValues.s_firstname}
                </FormBlockField>
                <FormBlockField title={`${i18n.gettext('Last name')}:`}>
                  {shippingValues.s_lastname}
                </FormBlockField>
              </View>
            )}
          >
            <Form
              ref="checkoutShipping"  // eslint-disable-line
              type={shippingFormFields}
              value={shippingValues}
              onChange={values => this.handleChange(values, 'shipping')}
              options={ShippingOptions}
            />
          </FormBlock>
        </KeyboardAwareScrollView>
        <CartFooter
          totalPrice={formatPrice(cart.subtotal_formatted.price)}
          btnText={i18n.gettext('Next').toUpperCase()}
          onBtnPress={() => this.handleNextPress()}
        />
      </View>
    );
  }
}

export default connect(
  state => ({
    auth: state.auth,
    cart: state.cart,
  }),
  dispatch => ({
    authActions: bindActionCreators(authActions, dispatch),
    cartActions: bindActionCreators(cartActions, dispatch),
  })
)(Checkout);
