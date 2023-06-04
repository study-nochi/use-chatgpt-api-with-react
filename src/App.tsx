import { useState } from "react";
import "./App.css";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
  MessageModel,
} from "@chatscope/chat-ui-kit-react";
import { CHAT_GPT_API_KEY } from "./config";

function App() {
  const [typing, setTyping] = useState(false);
  const [messages, setMessage] = useState<MessageModel[]>([
    {
      message: "한국어로 말하도록 학습된 Chat GPT 입니다.",
      sender: "ChatGPT",
      direction: "incoming",
      position: "first",
    },
  ]);

  const handleSend = async (message: string) => {
    const newMessage: MessageModel = {
      message,
      sender: "user",
      direction: "outgoing",
      position: "normal",
    };

    const newMessages = [...messages, newMessage];
    setMessage(newMessages);

    setTyping(true);

    processMessageToChatGPT(newMessages);
  };

  async function processMessageToChatGPT(chatMessages: MessageModel[]) {
    // chatMessages { sender: "user" or "ChatGPT", message: "The message content here"}
    // apiMesssages { role: "user" or "assistant", content: "The message content here"}

    const apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "ChatGPT") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role, content: messageObject.message };
    });

    const systemMessage = {
      role: "system",
      content: "Speack like a Korean",
    };

    const apiRequestBody = {
      model: "gpt-3.5-turbo",
      messages: [systemMessage, ...apiMessages],
    };

    await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + CHAT_GPT_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiRequestBody),
    })
      .then((data) => {
        return data.json();
      })
      .then((data) => {
        console.log(data);
        setMessage([
          ...chatMessages,
          {
            message: data.choices[0].message.content,
            sender: "ChatGPT",
            direction: "incoming",
            position: "normal",
          },
        ]);
        setTyping(false);
      });
  }

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <MainContainer>
        <ChatContainer>
          <MessageList
            scrollBehavior="smooth"
            typingIndicator={
              typing ? <TypingIndicator content="ChatGPT is typing" /> : null
            }
          >
            {messages?.map((message, i) => {
              return <Message key={i} model={message} />;
            })}
          </MessageList>
          <MessageInput placeholder="Type message here" onSend={handleSend} />
        </ChatContainer>
      </MainContainer>
    </div>
  );
}

export default App;
