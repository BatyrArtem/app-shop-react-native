import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as t from 'tcomb-form-native';
import ActionSheet from 'react-native-actionsheet';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

// Styles
import theme from '../../config/theme';

// Components
import Section from '../../components/Section';
import Spinner from '../../components/Spinner';
import Icon from '../../components/Icon';
import BottomActions from '../../components/BottomActions';

// Action
import * as productsActions from '../../actions/vendorManage/productsActions';

import i18n from '../../utils/i18n';
import { registerDrawerDeepLinks } from '../../utils/deepLinks';
import { getProductStatus } from '../../utils';

import {
  iconsMap,
  iconsLoaded,
} from '../../utils/navIcons';

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$grayColor',
  },
  scrollContainer: {
    paddingBottom: 14,
  },
  menuItem: {
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 10,
    paddingTop: 10,
    paddingBottom: 10,
  },
  menuItemTitle: {
    color: '#8f8f8f',
    fontSize: '0.8rem',
    paddingBottom: 4,
  },
  menuItemText: {
    width: '90%',
  },
  btnIcon: {
    color: '#898989',
  }
});

const Form = t.form.Form;
const formFields = t.struct({
  product: t.String,
  full_description: t.maybe(t.String),
  price: t.Number,
});
const formOptions = {
  disableOrder: true,
  fields: {
    full_description: {
      label: i18n.gettext('Full description'),
    }
  },
};

const MORE_ACTIONS_LIST = [
  i18n.gettext('Delete This Product'),
  i18n.gettext('Cancel'),
];

const STATUS_ACTIONS_LIST = [
  i18n.gettext('Make Product Disabled'),
  i18n.gettext('Make Product Hidden'),
  i18n.gettext('Make Product Active'),
  i18n.gettext('Cancel'),
];

class EditProduct extends Component {
  static propTypes = {
    productID: PropTypes.number,
    stepsData: PropTypes.shape({}),
    productsActions: PropTypes.shape({}),
    product: PropTypes.shape({}),
    loading: PropTypes.bool,
    navigator: PropTypes.shape({
      setTitle: PropTypes.func,
      setButtons: PropTypes.func,
      push: PropTypes.func,
      setOnNavigatorEvent: PropTypes.func,
    }),
  };

  constructor(props) {
    super(props);

    this.formRef = React.createRef();
    props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

  componentWillMount() {
    const {
      navigator,
      productID,
      productsActions
    } = this.props;
    productsActions.fetchProduct(productID);

    iconsLoaded.then(() => {
      navigator.setButtons({
        rightButtons: [
          {
            id: 'more',
            icon: iconsMap['more-horiz'],
          },
        ],
      });
    });
  }

  onNavigatorEvent(event) {
    const { navigator } = this.props;
    registerDrawerDeepLinks(event, navigator);
    if (event.type === 'NavBarButtonPress') {
      if (event.id === 'more') {
        this.ActionSheet.show();
      }
    }
  }

  handleMoreActionSheet = (index) => {
    const { navigator, product, productsActions } = this.props;
    if (index === 0) {
      productsActions.deleteProduct(product.product_id);
      navigator.pop();
    }
  }

  handleStatusActionSheet = (index) => {
    const { product, productsActions } = this.props;
    const statuses = [
      'D',
      'H',
      'A'
    ];
    const activeStatus = statuses[index];

    if (activeStatus) {
      productsActions.updateProduct(
        product.product_id,
        {
          status: activeStatus,
        }
      );
    }
  }

  handleSave = () => {
    const { product, productsActions } = this.props;
    const values = this.formRef.current.getValue();

    if (!values) { return; }

    productsActions.updateProduct(
      product.product_id,
      {
        ...values
      }
    );
  };

  renderMenuItem = (title, subTitle, fn = () => {}) => (
    <TouchableOpacity style={styles.menuItem} onPress={fn}>
      <View style={styles.menuItemText}>
        <Text style={styles.menuItemTitle}>{title}</Text>
        <Text
          style={styles.menuItemSubTitle}
        >
          {subTitle}
        </Text>
      </View>
      <Icon name="keyboard-arrow-right" style={styles.btnIcon} />
    </TouchableOpacity>
  );

  render() {
    const { navigator, loading, product } = this.props;

    if (loading) {
      return (
        <Spinner visible mode="content" />
      );
    }

    navigator.setTitle({
      title: i18n.gettext(product.product || '').toUpperCase(),
    });

    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Section>
            <Form
              ref={this.formRef}
              type={formFields}
              value={product}
              options={formOptions}
            />
          </Section>
          <Section wrapperStyle={{ padding: 0 }}>
            {this.renderMenuItem(
              i18n.gettext('Status'),
              getProductStatus(product.status).text,
              () => {
                this.StatusActionSheet.show();
              }
            )}
            {this.renderMenuItem(
              i18n.gettext('Pricing / Inventory'),
              i18n.gettext('%1, List price: %2, In stock: %3', product.product, product.list_price, product.amount),
              () => {
                navigator.push({
                  screen: 'VendorManagePricingInventory',
                  backButtonTitle: '',
                });
              }
            )}
            {this.renderMenuItem(
              i18n.gettext('Categories'),
              product.categories.map(item => item.category).join(', '),
              () => {
                navigator.push({
                  screen: 'VendorManageCategoriesPicker',
                  backButtonTitle: '',
                  passProps: {
                    selected: product.categories,
                  },
                });
              }
            )}
            {this.renderMenuItem(
              i18n.gettext('Shipping properties'),
              `${i18n.gettext('Weight: %1', product.weight)}${product.free_shipping ? i18n.gettext('Free shipping') : ''}`,
              () => {
                navigator.push({
                  screen: 'VendorManageShippingProperties',
                  backButtonTitle: '',
                  passProps: {
                    values: {
                      ...product
                    }
                  },
                });
              }
            )}
          </Section>
        </ScrollView>
        <BottomActions onBtnPress={this.handleSave} />
        <ActionSheet
          ref={(ref) => { this.ActionSheet = ref; }}
          options={MORE_ACTIONS_LIST}
          cancelButtonIndex={1}
          destructiveButtonIndex={0}
          onPress={this.handleMoreActionSheet}
        />
        <ActionSheet
          ref={(ref) => { this.StatusActionSheet = ref; }}
          options={STATUS_ACTIONS_LIST}
          cancelButtonIndex={3}
          destructiveButtonIndex={0}
          onPress={this.handleStatusActionSheet}
        />
      </View>
    );
  }
}

export default connect(
  state => ({
    notifications: state.notifications,
    loading: state.vendorManageProducts.loadingCurrent,
    product: state.vendorManageProducts.current,
  }),
  dispatch => ({
    productsActions: bindActionCreators(productsActions, dispatch)
  })
)(EditProduct);
