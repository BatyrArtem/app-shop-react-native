import React, { useEffect, useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Navigation } from 'react-native-navigation';
import * as nav from '../services/navigation';
import { iconsMap } from '../utils/navIcons';
import { toInteger, get } from 'lodash';
import i18n from '../utils/i18n';
import { isEmpty } from 'lodash';
import config from '../config';
import theme from '../config/theme';
import {
  formatPrice,
  isPriceIncludesTax,
  stripTags,
  formatDate,
} from '../utils';
import {
  VERSION_MVE,
  FEATURE_TYPE_DATE,
  FEATURE_TYPE_CHECKBOX,
} from '../constants';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Platform,
  Share,
} from 'react-native';

// Import actions.
import * as productsActions from '../actions/productsActions';
import * as wishListActions from '../actions/wishListActions';
import * as cartActions from '../actions/cartActions';
import * as vendorActions from '../actions/vendorActions';

// Components
import { ProductDetailOptions } from '../components/ProductDetailOptions';
import ProductImageSwiper from '../components/ProductImageSwiper';
import { AddToCartButton } from '../components/AddToCartButton';
import DiscussionList from '../components/DiscussionList';
import InAppPayment from '../components/InAppPayment';
import { QtyOption } from '../components/QtyOption';
import SectionRow from '../components/SectionRow';
import { Seller } from '../components/Seller';
import Section from '../components/Section';
import Spinner from '../components/Spinner';
import Rating from '../components/Rating';

const styles = EStyleSheet.create({
  container: {
    flex: 1,
  },
  descriptionBlock: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 14,
    paddingRight: 14,
  },
  nameText: {
    fontSize: '1.1rem',
    color: '$darkColor',
    marginBottom: 5,
    textAlign: 'left',
  },
  priceText: {
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '$darkColor',
    textAlign: 'left',
  },
  smallText: {
    fontSize: '0.8rem',
    fontWeight: 'normal',
    color: '$darkColor',
  },
  outOfStockText: {
    color: '$dangerColor',
    marginTop: 10,
    fontSize: '0.8rem',
    fontWeight: 'bold',
  },
  listPriceText: {
    textDecorationLine: 'line-through',
    color: '$darkColor',
    textAlign: 'left',
  },
  listPriceWrapperText: {
    textAlign: 'left',
  },
  promoText: {
    marginBottom: 10,
  },
  qtyOptionWrapper: {
    marginHorizontal: 15,
  },
  descText: {
    color: '$discussionMessageColor',
    textAlign: 'justify',
    paddingHorizontal: 14,
  },
  addToCartContainerWrapper: {
    shadowColor: '#45403a',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 24,
  },
  addToCartContainer: {
    paddingLeft: 14,
    paddingRight: 14,
    paddingBottom: 16,
    paddingTop: 8,
    backgroundColor: '#fff',
    flexDirection: 'row',
  },
  wrapperStyle: {
    padding: 0,
    paddingTop: 10,
    paddingBottom: 10,
    marginHorizontal: 10,
    borderRadius: 10,
    shadowColor: '#45403a',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 7,
    elevation: 24,
    marginBottom: 20,
  },
  sectionBtn: {
    paddingLeft: 14,
    paddingRight: 14,
    paddingTop: 12,
    paddingBottom: 6,
  },
  sectionBtnText: {
    color: '$primaryColor',
    fontSize: '0.9rem',
    textAlign: 'left',
    maxWidth: 100,
  },
  vendorWrapper: {
    paddingLeft: 14,
    paddingRight: 14,
    paddingTop: 8,
    paddingBottom: 8,
    marginBottom: 10,
  },
  vendorName: {
    fontSize: '0.9rem',
    textAlign: 'left',
    marginRight: 100,
  },
  vendorProductCount: {
    fontSize: '0.7rem',
    color: 'gray',
    marginBottom: 13,
    textAlign: 'left',
  },
  vendorDescription: {
    color: 'gray',
    textAlign: 'left',
  },
  vendorInfoBtn: {
    position: 'absolute',
    top: 10,
    right: '1rem',
  },
  rating: {
    marginLeft: -10,
    marginRight: -10,
    marginBottom: 5,
  },
  keyboardAvoidingContainer: {
    marginBottom: Platform.OS === 'ios' ? 122 : 132,
  },
  listDiscountWrapper: {
    backgroundColor: '$productDiscountColor',
    position: 'absolute',
    top: 4,
    right: 4,
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: 4,
    paddingRight: 4,
    borderRadius: 2,
  },
  listDiscountText: {
    color: '#fff',
  },
  inAppPaymentWrapper: {
    flex: 2,
    marginRight: 10,
  },
  zeroPrice: {
    paddingTop: 10,
  },
});

export const ProductDetailNew = ({
  pid,
  productsActions,
  wishListActions,
  vendorActions,
  cartActions,
  discussion,
  componentId,
  auth,
  hideWishList,
  wishList,
}) => {
  const [product, setProduct] = useState('');
  const [amount, setAmount] = useState(1);
  const [vendor, setVendor] = useState(null);

  const listener = {
    navigationButtonPressed: ({ buttonId }) => {
      if (buttonId === 'wishlist') {
        handleAddToWishList();
      }

      if (buttonId === 'share') {
        handleShare();
      }
    },
  };

  const fetchData = async (currentPid) => {
    const currentProduct = await productsActions.fetch(currentPid);
    const currentVendor = await vendorActions.fetch(currentProduct.company_id);
    const step = parseInt(currentProduct.qty_step, 10) || 1;
    setAmount(step);
    setVendor(currentVendor);
    setProduct(currentProduct);
  };

  useEffect(() => {
    fetchData(pid);
  }, []);

  useEffect(() => {
    if (product) {
      const setTopBarOptions = (product) => {
        const topBar = {
          title: {
            text: product.product,
          },
        };

        topBar.rightButtons = [
          {
            id: 'share',
            icon: iconsMap.share,
          },
        ];

        if (!hideWishList && !product.isProductOffer) {
          const wishListActive = wishList.items.some(
            (item) => parseInt(item.product_id, 10) === product.product_id,
          );
          topBar.rightButtons.push({
            id: 'wishlist',
            icon: iconsMap.favorite,
            color: wishListActive
              ? theme.$primaryColor
              : theme.$navBarButtonColor,
          });
        }

        Navigation.mergeOptions(componentId, {
          topBar,
        });
      };

      setTopBarOptions(product);
    }

    const listeners = Navigation.events().registerComponentListener(
      listener,
      componentId,
    );

    return () => {
      listeners.remove();
    };
  }, [componentId, listener, product, hideWishList, wishList]);

  const changeVariationHandler = async (variantId, variantOption) => {
    const selectedVariationPid = variantOption.product_id;
    const currnetVariationPid = product.selectedVariants[variantId].product_id;

    if (currnetVariationPid === selectedVariationPid) {
      return null;
    }

    fetchData(selectedVariationPid);
  };

  const changeOptionHandler = async (optionId, selectedOptionValue) => {
    const newOptions = { ...product.selectedOptions };
    newOptions[optionId] = selectedOptionValue;
    const recalculatedProduct = await productsActions.recalculatePrice(
      product.product_id,
      newOptions,
    );
    setProduct({ ...recalculatedProduct });
  };

  const renderVariationsAndOptions = () => {
    if (isEmpty(product.selectedOptions) && isEmpty(product.selectedVariants)) {
      return null;
    }

    return (
      <Section title={i18n.t('Select')} wrapperStyle={styles.wrapperStyle}>
        <ProductDetailOptions
          options={product.convertedVariants}
          selectedOptions={product.selectedVariants}
          changeOptionHandler={changeVariationHandler}
        />
        <ProductDetailOptions
          options={product.convertedOptions}
          selectedOptions={product.selectedOptions}
          changeOptionHandler={changeOptionHandler}
        />
      </Section>
    );
  };

  const renderDiscountLabel = () => {
    return (
      <View style={styles.listDiscountWrapper}>
        <Text style={styles.listDiscountText}>
          {`${i18n.t('Discount')} ${product.discount}%`}
        </Text>
      </View>
    );
  };

  const renderImage = () => {
    return (
      <View>
        <ProductImageSwiper>{product.images}</ProductImageSwiper>
        {product.discount && renderDiscountLabel()}
      </View>
    );
  };

  const renderName = () => {
    return <Text style={styles.nameText}>{product.product}</Text>;
  };

  const renderRating = () => {
    if (!product.rating) {
      return null;
    }

    let activeDiscussion = discussion.items[`p_${product.product_id}`];
    return (
      <Rating
        containerStyle={styles.rating}
        value={activeDiscussion.average_rating}
        count={activeDiscussion.search.total_items}
      />
    );
  };

  const renderPrice = () => {
    let discountPrice = null;
    let discountTitle = null;
    let showDiscount = false;

    if (toInteger(product.discount)) {
      discountPrice = product.base_price_formatted.price;
      discountTitle = `${i18n.t('Old price')}: `;
      showDiscount = true;
    } else if (toInteger(product.list_price)) {
      discountPrice = product.list_price_formatted.price;
      discountTitle = `${i18n.t('List price')}: `;
      showDiscount = true;
    }

    const inStock = !Number(product.amount);
    const isProductPriceZero = Math.ceil(product.price) !== 0;
    const productTaxedPrice = get(product, 'taxed_price_formatted.price', '');
    const productPrice =
      productTaxedPrice || get(product, 'price_formatted.price', '');
    const showTaxedPrice = isPriceIncludesTax(product);

    return (
      <View>
        {showDiscount && isProductPriceZero && (
          <Text style={styles.listPriceWrapperText}>
            {discountTitle}
            <Text style={styles.listPriceText}>
              {formatPrice(discountPrice)}
            </Text>
          </Text>
        )}
        {isProductPriceZero ? (
          <>
            <Text style={styles.priceText}>
              {formatPrice(productPrice)}
              {showTaxedPrice && (
                <Text style={styles.smallText}>
                  {` (${i18n.t('Including tax')})`}
                </Text>
              )}
            </Text>
          </>
        ) : (
          <Text style={styles.zeroPrice}>
            {i18n.t('Contact us for a price')}
          </Text>
        )}
        {inStock && (
          <Text style={styles.outOfStockText}>{i18n.t('Out of stock')}</Text>
        )}
      </View>
    );
  };

  const renderDesc = () => {
    if (!product.full_description) {
      return null;
    }

    return (
      <Section title={i18n.t('Description')} wrapperStyle={styles.wrapperStyle}>
        <Text style={styles.descText}>
          {stripTags(product.full_description).trim()}
        </Text>
      </Section>
    );
  };

  const renderQuantitySwitcher = () => {
    const step = parseInt(product.qty_step, 10) || 1;
    const max = parseInt(product.max_qty, 10) || parseInt(product.amount, 10);
    const min = parseInt(product.min_qty, 10) || step;

    if (product.isProductOffer) {
      return null;
    }

    return (
      <View style={styles.qtyOptionWrapper}>
        <QtyOption
          max={max}
          min={min}
          initialValue={amount || min}
          step={step}
          onChange={(val) => {
            setAmount(val);
          }}
        />
      </View>
    );
  };

  const renderDiscussion = () => {
    if (!product.rating) {
      return null;
    }

    let activeDiscussion = discussion.items[`p_${product.product_id}`];

    const masMore = activeDiscussion.search.total_items > 10;
    let title = i18n.t('Reviews');
    // eslint-disable-next-line eqeqeq
    if (activeDiscussion.search.total_items != 0) {
      title = i18n.t('Reviews ({{count}})', {
        count: activeDiscussion.search.total_items,
      });
    }

    return (
      <Section
        title={title}
        wrapperStyle={styles.wrapperStyle}
        showRightButton={true}
        rightButtonText={i18n.t('Write a Review')}
        onRightButtonPress={() => {
          nav.pushWriteReview(componentId, {
            activeDiscussion,
            discussionType: 'P',
            discussionId: product.product_id,
          });
        }}>
        <DiscussionList
          items={activeDiscussion.posts.slice(0, 4)}
          type={activeDiscussion.type}
        />
        {masMore && (
          <TouchableOpacity
            style={styles.sectionBtn}
            onPress={() => {
              nav.showDiscussion(componentId);
            }}>
            <Text style={styles.sectionBtnText}>{i18n.t('View All')}</Text>
          </TouchableOpacity>
        )}
      </Section>
    );
  };

  const handleShare = () => {
    const url = `${config.siteUrl}index.php?dispatch=products.view&product_id=${product.product_id}`;
    Share.share(
      {
        message: url,
        title: product.product,
        url,
      },
      {
        dialogTitle: product.product,
        tintColor: 'black',
      },
    );
  };

  const handleAddToWishList = (productOffer) => {
    const productOptions = {};

    const currentProduct = productOffer || product;

    if (!auth.logged) {
      return nav.showLogin();
    }

    // Convert product options to the option_id: variant_id array.
    Object.keys(currentProduct.selectedOptions).forEach((k) => {
      productOptions[k] = currentProduct.selectedOptions[k];
      if (currentProduct.selectedOptions[k].variant_id) {
        productOptions[k] = currentProduct.selectedOptions[k].variant_id;
      }
    });

    const products = {
      [currentProduct.product_id]: {
        product_id: currentProduct.product_id,
        amount: currentProduct.selectedAmount || 1,
        product_options: productOptions,
      },
    };

    return wishListActions.add({ products }, componentId);
  };

  const renderFeatures = () => {
    const renderFeatureItem = (feature, index, last) => {
      const { description, feature_type, value_int, value, variant } = feature;

      let newValue = null;
      switch (feature_type) {
        case FEATURE_TYPE_DATE:
          newValue = formatDate(value_int * 1000);
          break;
        case FEATURE_TYPE_CHECKBOX:
          newValue = feature.value === 'Y' ? i18n.t('Yes') : i18n.t('No');
          break;
        default:
          newValue = value || variant;
      }

      return (
        <SectionRow
          name={description}
          value={newValue}
          last={last}
          key={index}
        />
      );
    };

    const features = Object.keys(product.product_features).map(
      (k) => product.product_features[k],
    );

    if (!features.length) {
      return null;
    }

    const lastElement = features.length - 1;

    return (
      <Section title={i18n.t('Features')} wrapperStyle={styles.wrapperStyle}>
        {features.map((item, index) =>
          renderFeatureItem(item, index, index === lastElement),
        )}
      </Section>
    );
  };

  const renderVendorInfo = () => {
    if (config.version !== VERSION_MVE || !vendor) {
      return null;
    }

    return (
      <Section title={i18n.t('Vendor')} wrapperStyle={styles.wrapperStyle}>
        <View style={styles.vendorWrapper}>
          <Text style={styles.vendorName}>{vendor.company}</Text>
          <Text style={styles.vendorProductCount}>
            {i18n.t('{{count}} item(s)', { count: vendor.products_count })}
          </Text>
          <Text style={styles.vendorDescription}>
            {stripTags(vendor.description)}
          </Text>
          <TouchableOpacity
            style={styles.vendorInfoBtn}
            onPress={() => {
              nav.showModalVendorDetail({
                vendorId: vendor.company_id,
              });
            }}>
            <Text
              style={styles.sectionBtnText}
              numberOfLines={1}
              ellipsizeMode="tail">
              {i18n.t('Details')}
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.sectionBtn}
          onPress={() => {
            nav.showModalVendor({
              companyId: vendor.company_id,
            });
          }}>
          <Text style={styles.sectionBtnText}>{i18n.t('Go To Store')}</Text>
        </TouchableOpacity>
      </Section>
    );
  };

  const renderSellers = () => {
    if (!product.isProductOffer) {
      return null;
    }

    return (
      <Section title={i18n.t('Sellers')} wrapperStyle={styles.wrapperStyle}>
        {product.productOffers.products.map((el, index) => {
          return (
            <Seller
              productOffer={el}
              handleAddToWishList={() => handleAddToWishList(el)}
              isLastVendor={product.productOffers.products.length - 1 === index}
              key={index}
              onPress={() => handleAddToCart(true, el)}
            />
          );
        })}
      </Section>
    );
  };

  const handleAddToCart = (showNotification = true, productOffer) => {
    const productOptions = {};

    if (!auth.logged) {
      return nav.showLogin();
    }

    const currentProduct = productOffer || product;

    // Convert product options to the option_id: variant_id array.
    Object.keys(product.selectedOptions).forEach((k) => {
      productOptions[k] = product.selectedOptions[k];
      if (product.selectedOptions[k].variant_id) {
        productOptions[k] = product.selectedOptions[k].variant_id;
      }
    });

    const products = {
      [currentProduct.product_id]: {
        product_id: currentProduct.product_id,
        amount,
        product_options: productOptions,
      },
    };

    return cartActions.add({ products }, showNotification);
  };

  const renderAddToCart = () => {
    const canPayWithApplePay = Platform.OS === 'ios' && config.applePay;

    if (product.isProductOffer) {
      return null;
    }

    return (
      <View style={styles.addToCartContainerWrapper}>
        <View style={styles.addToCartContainer}>
          {canPayWithApplePay && (
            <View style={styles.inAppPaymentWrapper}>
              <InAppPayment onPress={this.handleApplePay} />
            </View>
          )}
          <AddToCartButton onPress={() => handleAddToCart()} />
        </View>
      </View>
    );
  };

  if (!product) {
    return <Spinner visible={true} />;
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        {renderImage()}
        <View style={styles.descriptionBlock}>
          {renderName()}
          {renderRating()}
          {renderPrice()}
        </View>
        {renderQuantitySwitcher()}
        {renderVariationsAndOptions()}
        {renderSellers()}
        {renderDesc()}
        {renderFeatures()}
        {renderDiscussion()}
        {renderVendorInfo()}
      </ScrollView>
      {renderAddToCart()}
    </View>
  );
};

export default connect(
  (state) => ({
    settings: state.settings,
    productDetail: state.productDetail,
    discussion: state.discussion,
    auth: state.auth,
    wishList: state.wishList,
  }),
  (dispatch) => ({
    cartActions: bindActionCreators(cartActions, dispatch),
    productsActions: bindActionCreators(productsActions, dispatch),
    wishListActions: bindActionCreators(wishListActions, dispatch),
    vendorActions: bindActionCreators(vendorActions, dispatch),
  }),
)(ProductDetailNew);
