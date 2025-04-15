"use client";
import Navigation from "@/components/home/Navigation";
import Main from "@/components/home/Main";
import { useAppcontext } from "@/components/AppContext";

export default function Home() {
  const {
    state: { themeMode },
  } = useAppcontext();
  

  return (
    <div className="h-full flex">
      <Navigation />
      <Main />
    </div>
  );
}
