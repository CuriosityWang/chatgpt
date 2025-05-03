import { useAppcontext } from "@/components/AppContext";
import { useEventBusContext } from "@/components/EventBusContext";
import { ActionType } from "@/reducers/AppReducer";
import { Chat } from "@/types/chat";
import { useEffect, useState } from "react";
import { AiOutlineEdit } from "react-icons/ai";
import { MdCheck, MdClose, MdDeleteOutline } from "react-icons/md";
import { PiChatBold, PiTrashBold } from "react-icons/pi";

type Props = {
  item: Chat;
  selected: boolean;
  onSelected: (chat: Chat) => void;
};

export default function ChatItem({ item, selected, onSelected }: Props) {
  const [isDelete, setIsDelete] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [title, setTitle] = useState(item.title);
  const { publish } = useEventBusContext();
  
  const {
    state: { selectedChat },
    dispatch,
  } = useAppcontext();

  //当依赖项 selected 变化时，设置 isEdit 为 false
  useEffect(() => {
    setIsEdit(false);
    setIsDelete(false);
  }, [selected]);

  async function updateChat() {
    const response = await fetch("/api/chat/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: item.id, title }),
    });
    if (!response.ok) {
      console.log(response.statusText);
      return;
    }
    const { code } = await response.json();
    if (code === 0) {
      publish("fetchChatList");
    }
  }

  async function deleteChat() {
    console.log("deleteChat", item.id);
    const response = await fetch(`/api/chat/delete?id=${item.id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      console.log(response.statusText);
      return;
    }
    const { code } = await response.json();
    if (code === 0) {
      publish("fetchChatList");
      dispatch({
        type: ActionType.UPDATE,
        field: "selectedChat",
        value: null,
      });
    }
    console.log("delete", item.id);

  }

  return (
    <li
      onClick={() => {
        onSelected(item);
      }}
      key={item.id}
      className={`group flex items-center p-3 space-x-3 cursor-pointer rounded-md hover:bg-gray-800 ${
        selected ? "bg-gray-800 pr-[3.5em]" : ""
      }`}
    >
      <div>{isDelete ? <PiTrashBold /> : <PiChatBold />}</div>
      {/* 这段代码控制如果是 selected 并且 isEdit 的话，就显示输入框，否则显示 item */}
      {selected && isEdit ? (
        <input
          autoFocus={true}
          className="flex-1 min-w-0 bg-transparent outline-none"
          defaultValue={title}
          onChange={(e) => {
            setTitle(e.target.value);
          }}
        ></input>
      ) : (
        <div className="relative flex-1 whitespace-nowrap overflow-hidden">
          {item.title}
          <span
            className={`group-hover:from-gray-800 absolute right-0 inset-y-0 w-8 bg-gradient-to-l ${
              selected ? "from-gray-800" : "from-gray-900"
            }`}
          ></span>
        </div>
      )}
      {/* 这段代码控制的是，如果是 selected 状态 并且点击了 edit 就切换图标*/}
      {selected && (
        <div className="absolute right-1 flex ">
          {isEdit || isDelete ? (
            <>
              <button
                className="p-1  hover:text-white"
                onClick={(e) => {
                  if (isDelete) {
                    // Handle delete action here
                    deleteChat();
                    // setIsDelete(false);
                  } else {
                    // Handle edit action here
                    updateChat();
                    // setIsEdit(false);
                  }
                  e.stopPropagation();
                }}
              >
                <MdCheck />
              </button>
              <button className="p-1 hover:text-white">
                <MdClose />
              </button>
            </>
          ) : (
            <>
              <button
                className="p-1  hover:text-white"
                onClick={(e) => {
                  setIsDelete(false);
                  setIsEdit(true);
                  e.stopPropagation();
                }}
              >
                <AiOutlineEdit />
              </button>
              <button
                className="p-1 hover:text-white"
                onClick={(e) => {
                  setIsDelete(true);
                  e.stopPropagation();
                }}
              >
                <MdDeleteOutline />
              </button>
            </>
          )}
        </div>
      )}
    </li>
  );
}
