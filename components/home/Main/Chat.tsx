import Button from "@/components/common/Button";
import { MdRefresh } from "react-icons/md";
import { PiLightningFill, PiStopBold } from "react-icons/pi";
import { FiSend } from "react-icons/fi";
import TextareaAutoSize from "react-textarea-autosize";
import { useState, useRef, use, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Message, MessageRequestBody } from "@/types/chat";
import { useAppcontext } from "@/components/AppContext";
import { ActionType } from "@/reducers/AppReducer";
import {
  useEventBusContext,
  EventListener,
} from "@/components/EventBusContext";

export default function Chat() {

  const [messageText, setMessageText] = useState("");
  const stopRef = useRef(false);
  const chatIdRef = useRef("");
  const {
    state: { messageList, currentModel, streamingId, selectedChat },
    dispatch,
  } = useAppcontext();

  useEffect(() => {
    console.log("selectedChat change", selectedChat);
    if (chatIdRef.current === selectedChat?.id) {
      return;
    }
    stopRef.current = true;
    chatIdRef.current = selectedChat?.id ?? "";
    console.log("chatIdRef.current", chatIdRef.current);
  }, [selectedChat]);

  const { publish, subscribe, unsubscribe } = useEventBusContext();

  useEffect(() => {
    const callback: EventListener = (message: string) => {
      send(message);
    };
    subscribe("createNewChat", callback);
    return () => {
      unsubscribe("createNewChat", callback);
    };
  }, []);

  async function deleteMessage(id: string) {
    const response = await fetch(`/api/message/delete?id=${id}`, {
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

    return code === 0;
  }

  async function createOrUpdateMessage(message: Message) {
    const response = await fetch("/api/message/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });
    if (!response.ok) {
      console.log(response.statusText);
      return;
    }
    const { data } = await response.json();
    publish("fetchChatList");

    if (!chatIdRef.current && !selectedChat) {
      chatIdRef.current = data.message.chatId;
      dispatch({
        type: ActionType.UPDATE,
        field: "selectedChat",
        value: { id: chatIdRef.current },
      });
    }

    return data.message;
  }

  async function send(content: string) {
    const message: Message = await createOrUpdateMessage({
      id: "",
      role: "user",
      content,
      chatId: chatIdRef.current,
    });
    dispatch({ type: ActionType.ADD_MESSAGE, message });
    const messages = messageList.concat([message]);
    doSend(messages);
  }

  async function resend() {
    const messages = [...messageList];
    if (
      messageList.length !== 0 &&
      messageList[messageList.length - 1].role === "assistant"
    ) {
      const res = await deleteMessage(messageList[messageList.length - 1].id);
      if (!res) {
        console.log("delete error");
        return;
      }
      dispatch({
        type: ActionType.REMOVE_MESSAGE,
        message: messages[messages.length - 1],
      });
      messages.splice(messages.length - 1, 1);
      doSend(messages);
    }
  }

  async function doSend(messages: Message[]) {
    stopRef.current = false; // 没看懂，发送消息之前重置停止标志，因为切换对话时，可能没有接受消息
    const body: MessageRequestBody = { messages, model: currentModel };
    setMessageText("");
    const controller = new AbortController();
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      console.log(response.statusText);
      return;
    }
    if (!response.body) {
      console.log("body error");
      return;
    }
    const responseMessage: Message = await createOrUpdateMessage({
      id: "",
      role: "assistant",
      content: "",
      chatId: chatIdRef.current,
    });
    dispatch({ type: ActionType.ADD_MESSAGE, message: responseMessage });
    dispatch({
      type: ActionType.UPDATE,
      field: "streamingId",
      value: responseMessage.id,
    });
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let content = "";
    while (!done) {
      if (stopRef.current) {
        controller.abort();
        break;
      }
      const result = await reader.read();
      done = result.done;
      const chunk = decoder.decode(result.value);
      content += chunk;
      dispatch({
        type: ActionType.UPDATE_MESSAGE,
        message: {
          ...responseMessage,
          content: content,
        },
      });
    }
    // if (selectedChat && selectedChat.id === chatIdRef.current) {
    //   createOrUpdateMessage({
    //     ...responseMessage,
    //     content: content,
    //   });
    //   dispatch({
    //     type: ActionType.UPDATE,
    //     field: "streamingId",
    //     value: "",
    //   });
    // }
    createOrUpdateMessage({
      ...responseMessage,
      content: content,
    });
    dispatch({
      type: ActionType.UPDATE,
      field: "streamingId",
      value: "",
    });
  }

  return (
    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-b from-[rgba(255,255,255,0)] from-[13.94%] to-[#fff] to-[54.73%] pt-10 dark:from-[rgba(53,55,64,0)] dark:to-[#353740] dark:to-[58.85%]">
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center px-4 space-y-4">
        {messageList.length !== 0 &&
          (streamingId !== "" ? (
            <Button
              icon={PiStopBold}
              variant="text"
              className="font-medium"
              onClick={() => {
                stopRef.current = true;
              }}
            >
              停止生成
            </Button>
          ) : (
            <Button
              icon={MdRefresh}
              variant="text"
              className="font-medium"
              onClick={() => {
                resend();
              }}
            >
              重新生成
            </Button>
          ))}
        <div className="flex items-end w-full border border-black/10 dark:border-gray-800/50 bg-white dark:bg-gray-700 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.1)] py-4">
          <div className="mx-3 mb-2.5 text-primary-500">
            <PiLightningFill />
          </div>
          <TextareaAutoSize
            className="outline-none flex-1 max-h-64 mb-1.5 bg-transparent text-black dark:text-white resize-none border-0"
            placeholder="输入一条消息..."
            rows={1}
            value={messageText}
            onChange={(e) => {
              setMessageText(e.target.value);
            }}
          />
          <Button
            className="mx-3 !rounded-lg"
            icon={FiSend}
            disabled={messageText.trim() === "" || streamingId !== ""}
            variant="text"
            onClick={() => {
              send(messageText);
            }}
          />
        </div>
        <footer className="text-center text-sm text-gray-700 dark:text-gray-300 px-4 pb-6">
          ©️{new Date().getFullYear()}&nbsp;{" "}
          <a
            className="font-medium py-[1px] border-b border-dotted border-black/60 hover:border-black/0 dark:border-gray-200 dark:hover:border-gray-200/0 animated-underline"
            href="https://www.cnblogs.com/curiositywang"
            target="_blank"
          >
            CuriosityWang
          </a>
          .&nbsp;基于第三方提供的接口
        </footer>
      </div>
    </div>
  );
}
