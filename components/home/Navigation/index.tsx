"use client";

import { useAppcontext } from "@/components/AppContext";
import MenuBar from "@/components/home/Navigation/MenuBar";
import ToolBar from "@/components/home/Navigation/ToolBar";
import ChatList from "./ChatList";

export default function Navigation() {
  const {
    state: { displayNavigation },
  } = useAppcontext();
  return (
    <nav
      className={`${
        displayNavigation ? "" : "hidden" 
      } flex flex-col  relative h-full w-[260px] bg-gray-900 text-gray-300 p-2`}
    >
      <MenuBar />
      <ChatList />
      <ToolBar />
    </nav>
  );
}
