"use client";

import { useAppcontext } from "@/components/AppContext";
import Button from "@/components/common/Button";
import { ActionType } from "@/reducers/AppReducer";
import { LuPanelLeft } from "react-icons/lu";

export default function Menu() {
  const {
    state: { displayNavigation },
    dispatch,
  } = useAppcontext();
  // console.log('displayNavigation:', displayNavigation);
  return (
    <Button
      icon={LuPanelLeft}
      className={`${displayNavigation ? "hidden" : ""} fixed left-2 top-3`}
      variant="outline"
      onClick={() => {
        dispatch({
          type: ActionType.UPDATE,
          field: "displayNavigation",
          value: true,
        });
      }}
    ></Button>
  );
}
