"use client"

import { useEffect, useState } from "react";
import useWebSocket, { ReadyState } from 'react-use-websocket';

interface Props {
  params: {
    id: string;
  };
}

export default function GamePage(props: Props) {
  const [messages, setMessages] = useState<string[]>([]);
  const { lastJsonMessage, lastMessage, readyState, sendMessage } = useWebSocket<{ asd: number }>('ws://localhost:3333/socket/' + props.params.id);

  useEffect(() => {
    if (!lastMessage) {
      return;
    }
    console.log(lastMessage, lastJsonMessage);
    setMessages((prevMessages) => [...prevMessages, lastMessage.data]);
  }, [lastMessage]);

  return (
    <div>
      <p>{props.params.id}</p>
      {messages.map((message, idx) => (
        <p key={idx}>{message}</p>
      ))}
      <button disabled={readyState !== ReadyState.OPEN} onClick={() => sendMessage(`Hi ${Date.now()}`)}>{"Send message"}</button>
    </div>
  );
}
