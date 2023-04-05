const Quote = ({contact, repliedMessage}) => (
  <div className="in-chat-reply-to-container">
    <h1>{contact.name}</h1>
    <p>{repliedMessage.preview.message}</p>
  </div>
);

export const ChatRepliedQuote = ({message, contact, repliedMessage}) => {
  if (message?.reply && repliedMessage) {
    return (
      <Quote
        contact={contact}
        repliedMessage={repliedMessage}
      />
    );
  } else {
    return '';
  }
};
