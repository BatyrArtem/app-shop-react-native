import React from 'react';
import EStyleSheet from 'react-native-extended-stylesheet';
import { TouchableOpacity, Image } from 'react-native';
import Swiper from 'react-native-swiper';
import * as nav from '../services/navigation';
import theme from '../config/theme';

const styles = EStyleSheet.create({
  productImage: {
    width: '100%',
    height: '100%',
//    resizeMode: 'contain',
  },
});

// изменения внутри карточки товара сдвиг фотографии
const SwiperWrapper = ({ children }) => {
  return (
    <Swiper
      horizontal={true}
      height={500}
//       width={401}
      removeClippedSubviews={false}
      activeDotColor={theme.$dotsSwiperColor}>
      {children.map((img, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => {
            nav.showGallery({
              images: [...children],
              activeIndex: index,
            });
          }}>
          <Image source={{ uri: img }} style={styles.productImage} />
        </TouchableOpacity>
      ))}
    </Swiper>
  );
};

const MemoizedSwiperWrapper = React.memo(SwiperWrapper);
export default MemoizedSwiperWrapper;
