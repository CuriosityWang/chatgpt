import Chat from "./Chat";
import Menu from "./ConMenu";
import MessageList from "./MessageList";
import Welcome from "./Welcome";
import { useAppcontext } from "@/components/AppContext";

export default function Main() {
  const {
    state : { selectedChat },
  } = useAppcontext();

  return (
    <div className="flex-1 relative">
      <main className="overflow-y-auto w-full h-full bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100">
        <Menu />
        { selectedChat === undefined && <Welcome />}
        <MessageList />
        <Chat />
      </main>
    </div>
  );
}
