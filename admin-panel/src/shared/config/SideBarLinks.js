import AnalyticsIcon from "../icon/AnalyticsIcon";
import BlogIcon from "../icon/BlogIcon";
import CategoriesIcon from "../icon/CategoriesIcon";
import OrdersIcon from "../icon/OrdersIcon";
import ProductsIcon from "../icon/ProductsIcon";
import PromoIcon from "../icon/PromoIcon";
import WarehouseIcon from "../icon/WarehouseIcon";
import UsersIcon from "../icon/UsersIcon";


export const sidebarLinks = [
  
  { title: "Заказы", icon: OrdersIcon, path: "/orders" },
  { title: "Товары", icon: ProductsIcon, path: "/products" },
  { title: "Категории", icon: CategoriesIcon, path: "/categories" },
  { title: "Склад", icon: WarehouseIcon, path: "/warehouse" },
  { title: "Клієнти", icon: UsersIcon, path: "/users" },
  { title: "Контент", icon: BlogIcon, path: "/content" },
  // { title: "Аналитика", icon: AnalyticsIcon, path: "/analytics" },
  // { title: "Промокоды", icon: PromoIcon, path: "/promo" },
];