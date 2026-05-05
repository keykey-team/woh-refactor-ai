"use client";

import ProductItem from "@entities/product";
import CartButton from "@features/cart-buttons";
import Counter from "@features/counter";
import WishlistButton from "@features/wish-buttons";
import { BREAKPOINTS } from "@shared/index";
import {
  Swiper,
  SwiperSlide,
} from "swiper/react";

const TopProdsSwiper = ({ locale, actionsProducts = [] }) => {


  return (
    <div className="top-prods section-margin">
      <h2 className="top-prods__title">
        Рекомендовані товари
      </h2>

      <Swiper
        className="top-prods-swiper"
        modules={[]}
        spaceBetween={16}
        slidesPerView={2}
        loop={false}
        breakpoints={{
          [BREAKPOINTS.tablet]: {
            slidesPerView: 3.9,
            spaceBetween: 16,
          },
          [BREAKPOINTS.desktop]: {
            slidesPerView: 6,
            spaceBetween: 24,
          },
        }}
      >
        {/* {products.map((prod, index) => (
          <SwiperSlide key={index}>
            <ProductItem
              product={prod}
              location="swiper"
            />
          </SwiperSlide>
        ))} */}

        {actionsProducts.map((prod, index) => (
          <SwiperSlide key={index}>
            <ProductItem
              actionButtons={{
                CartButton: () => (
                  <CartButton location="prod-item" product={prod} />
                ),
                 WishButton: () => (
                      <WishlistButton
                        product={prod}
                        className="wishlist-button"
                      />
                    ),
                 Counter: (props) => (
                   <Counter prod={props?.product || prod} />
                 ),
              }}
             
              product={prod}
              location="swiper"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default TopProdsSwiper;
