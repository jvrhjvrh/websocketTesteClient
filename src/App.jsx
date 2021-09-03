import React,{useEffect, useRef, useState} from 'react';
import {w3cwebsocket} from 'websocket';
import './App.css';

const {REACT_APP_WEB_SOCKET_URL} = process.env;

const client = new w3cwebsocket(REACT_APP_WEB_SOCKET_URL);

const App = () => {
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const scroll = useRef();

  useEffect(() => {
    client.onopen = () => {
      console.log('WebSocket Client Connected');
      setLoading(false);
    };
    client.onerror = (error) => {
      console.log(error);
    }
    return () => client.close();
  }, []);

  if(loading) return <div>Loading</div>;

  client.onmessage = (message) => {
    const m = JSON.parse(message.data);
    switch(m.type) {
      case 'oldMessages':
        setMessages([...m.message, ...messages]);
        return;
      case 'allUsers':
        setUsers(m.message);
        return;
      case 'connectUser':
        setUsers([...users, m.message]);
        return;
      case 'disconnectUser':
        setUsers(users.filter(x => x !== m.message));
        return;
      case 'newMessage':
        setMessages([...messages, m.message]);
        const {current: {scrollTop, scrollHeight, clientHeight}} = scroll;
        if(scrollTop === scrollHeight - clientHeight - 20)
          scroll.current.scrollTop = scrollHeight - clientHeight;
        return;
      default:
        return;
    }
  };

  const sendMessage = () => {
    if(!input) return;
    client.send(JSON.stringify({type: 'newMessage', message: input}))
    setInput("");
    const {current: {scrollHeight, clientHeight}} = scroll;
    scroll.current.scrollTop = scrollHeight - clientHeight;
  }

  const checkEnter = (e) => {
    if(e.which === 13)
      sendMessage();
  }

  return (
    <div className="chat-body-container">
      <div className="header-container">
        <div>
          My chatroom
        </div>
      </div>
      <div ref={scroll} className="main-container">
        {messages.map((x, index) => <div className="message" key={index}><span>{`${x.user ? `${x.user}: ` : ''}${x.message}`}</span></div>)}
      </div>
      <div className="users-container">
        {users.map((x, index) => <div className="user" key={index}>{x}</div>)}
      </div>
      <input onKeyPress={e => checkEnter(e)} onChange={e => setInput(e.target.value)} value={input} className="text-input"/>
      <button className="send-button" onClick={sendMessage}>
        Send
      </button>
    </div>
  );
};

export default App;
