"use client";

import { Action, initState, reducer, State } from "@/reducers/AppReducer";
import {
  Dispatch,
  ReactNode,
  createContext,
  useContext,
  useMemo,
  useReducer,
  useState,
} from "react";


type AppcontextProps = {
  state: State
  dispatch: Dispatch<Action>
};

const AppContext = createContext<AppcontextProps>(null!);
// 这个全局上下文本质上也是一个组件，所以需要定义然后导出

export function useAppcontext() {
  return useContext(AppContext);
}

export default function AppContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [state, dispatch] = useReducer(reducer, initState)
  const contextValue = useMemo(() => {
    return { state, dispatch };
  }, [state, dispatch]);
  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}
