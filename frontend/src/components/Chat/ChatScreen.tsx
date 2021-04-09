import React, { Component, useState } from "react";
import './ChatScreen.css';

const ChatScreen = () => {
  const [count, setCount] = useState(0);

  const  increment = () => {
        setCount(count + 1);
    };

    return (
      <div>
          <body>
            <div className='heading'>Chat Box</div>
            <div className='mbox'>
                <ul id="messages"/>
            </div>
            <form id="form" action="">
              <input id="input" autoComplete="off" />
              <button type='submit' >Send</button>
            </form>
          </body>
      </div>
    );
};
export default ChatScreen