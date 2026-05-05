import { fetchCartFromDB } from "@entities/cart";
import { getWishlistData } from "@entities/wishlist";
import Cookies from "js-cookie";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export function DataLoader() {
  const dispatch = useDispatch();
  const id = Cookies.get("profile_id");

  useEffect(() => {
    if (!id) return;

    dispatch(fetchCartFromDB(id));
    dispatch(getWishlistData());
  }, [dispatch, id]);

  return null;
}
