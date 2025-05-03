import { sleep } from "@/common/util";
import { MessageRequestBody } from "@/types/chat";
import { NextRequest, } from "next/server";

export async function POST(request: NextRequest) {
    const { messages } = await request.json() as MessageRequestBody
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
        async start(controller) {
            const messageText = "经过上面的介绍，我们会发现，栈是从高地址向低地址增长的，并且局部变量都保存在当前栈帧的基地址之下；当前栈帧的基地址之上则包含了当前函数的返回地址，那么是不是可以通过某种方式，去修改这个返回地址，来实现栈溢出攻击呢，答案是可以的；"
            for (let i = 0; i < messageText.length; i++) {
                await sleep(50)
                controller.enqueue(encoder.encode(messageText[i]))
            }
            controller.close()
        }
    })
    return new Response(stream)
}