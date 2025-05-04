# ChatGPT 前端开发

最近在学校把导师安排的项目结项了，然后课余时间花了差不多两个周左右的时间跟着这个[项目](https://x.zhixing.co/courses/react-hands-on-tutorial-for-beginners)做了一下，主要是想先熟悉一下前端开发的大致流程。

<img src="https://img.curiosity.wang/images/2025/05/04/image-20250504195620661.png" alt="image-20250504195620661" style="zoom:50%;" />

项目代码：https://github.com/CuriosityWang/chatgpt

项目演示：http://localhost:3000/

## 收获

目前还没有详细的学习对应方法的实现，思路是先熟悉整个项目的逻辑，写完之后最大的感受有以下几点：

1. 一个前端系统是由一个个的组件组合起来的。比如上图的页面是由左侧的对话页和右侧的聊天页组成，对话页又由`MemuBar`、

   `ChatList`、`ToolBar`等组件构成，聊天页又由`Welcome `、`MessageList`、`Chat`等组件构成。

2. 组件之间并不是互相完全独立的状态，每个**组件或者组件之间**都会依赖一些数据流来实现业务逻辑，我目前用到的有以下几种信息传递，父组件和子组件之间的数据传递、全局的状态信息（state），全局的事件注册（有点像回调函数）。比如会使用一个全局的 State 维护当前使用的大模型，当前选中的对话。既然有全局的State，那么每个组件也会有自己独立的数据，并且这二者的生命周期有一定的区别。

3. 前端效率优化问题，默认情况下，当父组件重新渲染，也会引发其子组件的重新渲染。项目的`MessageList `组件由一系列子组件`Markdown`子组件构成如下图：

   <img src="https://img.curiosity.wang/images/2025/05/04/image-20250504210628854.png" alt="image-20250504210628854" style="zoom: 33%;" />

由于项目实现了一个类似LRU 的思路，即每次进行聊天的时候，都会把这个聊天框提到最，因此需要触发`MessageList`的刷新，但是这个时候其对话内容是不变的，所以可以使用 给 Markdown 组件加 Memo避免子组件的重新刷新。

## 优化

我对项目的一个逻辑进行了优化，即当消息流正在输出的时候，需要点击两次新建对话才会进入欢迎页，优化之后点击一次就可以进入欢迎页。

| 优化前（点击两次新建对话）                                   | 优化后（点击一次新建对话）                                   |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| ![May-04-2025 21-53-33](https://img.curiosity.wang/images/2025/05/04/May-04-2025-21-53-33.gif) | ![May-04-2025 21-36-48](https://img.curiosity.wang/images/2025/05/04/May-04-2025-21-36-48.gif) |

可以看到优化前，点击一下新建对话之后，**欢迎页一闪而过，然后紧接着又显示了当前的对话框**。由于点击新建对话会设置全局的selectedChat 为 null。同时欢迎页的显示逻辑如下，那为什么对话流式输出的时候会一闪而过呢？

<img src="https://img.curiosity.wang/images/2025/05/04/image-20250504214734774.png" alt="image-20250504214734774" style="zoom: 67%;" />

排查之后发现是因为流式输出的副作用，当点进新建对话之后，会将对话 id 设置为 null（此时欢迎页出现），但是流式输出会把当前的终止的信息传递给后端，之后需要检查一下当前的对话是不是新对话（当 对话 id 为 null 并且有消息发送的时候就根据后端的 id 设置对话 id），所以当点击新建对话之后，对话 id 被改变了两次，一次是设置为 null，因此是流式输出设置为新的 id。所以根据下面的全局状态的生命周期做了一个条件判断，实现上面的优化。

```tsx
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
 // "selectedChat"是一个全局的 state，异步函数使用的是调用时的数据，即使执行的时候被修改也还是调用时的数据。
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

```

## 不足与计划

1. 设置每个元素样式的时候，我发现我对 css和 html 的一些布局，样式设置不够熟悉，调整样式的时候甚至有点痛苦，针对这一点我觉得我需要回顾一下前端三件套。
2. 我目前对于前端设计模式 MVC，MVVM 的感知还比较弱，因此计划在补充完前面的前端基础之后，后面再结合 Electron 写一个更大一点的本地应用，熟悉一下。
