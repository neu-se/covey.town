import React from 'react';
import MDSpinner from 'react-md-spinner';

import emptyChatImage from '../../assets/empty-state.svg';

class MessageList extends React.Component {
  render() {
    const { isLoading, messages, user } = this.props;

    let chatContent = (
      <div className='loading-messages-container'>
        <MDSpinner size='100' />
        <span className='loading-text'>Loading Messages</span>
      </div>
    );

    if (!isLoading && !messages.length) {
      chatContent = (
        <div className='text-center img-fluid empty-chat'>
          <div className='empty-chat-holder'>
            <img src={emptyChatImage} className='img-res' alt='empty chat' />
          </div>

          <div>
            <h2> No new message? </h2>
            <h6 className='empty-chat-sub-title'>Send your first message below.</h6>
          </div>
        </div>
      );
    } else if (!isLoading && messages.length) {
      chatContent = messages.map(message => {
        if (this.props.renderMessage) {
          return this.props.renderMessage(message);
        } else {
          let isUser = user.uid === message.sender.uid;
          let renderName;
          if (isUser) {
            renderName = null;
          } else {
            renderName = <div className='sender-name'>{message.sender.name}</div>;
          }
          return (
            <div
              key={message.id}
              className='chat-bubble-row'
              style={{ flexDirection: isUser ? 'row-reverse' : 'row' }}>
              <img
                src={message.sender.avatar}
                alt='sender avatar'
                className='avatar'
                style={isUser ? { marginLeft: '15px' } : { marginRight: '15px' }}
              />
              <div className={`chat-bubble ${isUser ? 'is-user' : 'is-other'}`}>
                {renderName}
                <div className='message' style={{ color: isUser ? '#FFF' : '#2D313F' }}>
                  {message.text}
                </div>
              </div>
            </div>
          );
        }
      });
    }
    return chatContent;
  }
}

export default MessageList;
