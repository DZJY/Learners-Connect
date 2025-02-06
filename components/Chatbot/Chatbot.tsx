import { useState, useEffect } from 'react';
import { FiMessageSquare, FiUser, FiMessageCircle, FiX } from 'react-icons/fi';
import { Paper, Button, Text, Avatar, Box, Input, useMantineTheme } from '@mantine/core';
import styles from './Chatbot.module.css'; // Import your styles

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0', // Initial id
      text: 'Hi, how may I help you today?',
      isUserMessage: false, // It's a bot message
    },
  ]);
  const [userInput, setUserInput] = useState('');
  const [aiReply, setAiReply] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dots, setDots] = useState('.');
  const theme = useMantineTheme();

  const handleToggleChatbot = () => {
    setIsOpen((prevState) => !prevState);
  };

  const handleMessageSubmit = async () => {
    // Add user's message to the chat
    const userMessage: Message = {
      id: new Date().getTime().toString(),
      text: userInput,
      isUserMessage: true,
    };
    setIsLoading(true); // Set loading to true when the request starts
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setUserInput('');

    // Call AI API and generate AI's reply
    const aiReply = await generateAiReply(userInput);
    setAiReply(aiReply);

    // Add AI's reply to the chat
    const aiMessage: Message = {
      id: new Date().getTime().toString(),
      text: aiReply,
      isUserMessage: false,
    };
    setMessages((prevMessages) => [...prevMessages, aiMessage]);
    setIsLoading(false); // Set loading to false when the request ends
  };

  const generateAiReply = async (messageText: string): Promise<string> => {
    const response = await fetch('/api/chatbot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: messageText }),
    });
    const data = await response.json();

    return data.aiReply || '';
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(event.target.value);
  };

  const handleInputKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleMessageSubmit();
    }
  };
  useEffect(() => {
    if (isLoading) {
      const intervalId = setInterval(() => {
        setDots((prev) => (prev.length >= 3 ? '.' : prev + '.'));
      }, 500);

      return () => clearInterval(intervalId);
    }
  }, [isLoading]);

  return (
    <>
      {!isOpen && (
        <Button
          onClick={handleToggleChatbot}
          variant="light"
          radius="xl"
          className={styles.buttonClosed}
        >
          <FiMessageSquare size={24} />
        </Button>
      )}
      {isOpen && (
        <div className={styles.chatbotContainer}>
          <Paper className={styles.chatbotPaper} shadow="xs">
            <Box className={styles.messageContainer}>
              <Button
                onClick={handleToggleChatbot}
                variant="light"
                className={styles.closeButton}
              >
                <FiX size={24} />
              </Button>
              <Text className={styles.text} size="xl" weight={700} align="center">
                SummAIze Bot
              </Text>
              <Box className={styles.messagesBox}>
                {messages.map((message) => (
                  <Box
                    className={message.isUserMessage ? styles.messageBoxUser : styles.messageBox}
                  >
                    <Box
                      className={
                        message.isUserMessage ? styles.messageFlexUser : styles.messageFlex
                      }
                    >
                      <Avatar
                        radius="xl"
                        size="xs"
                        className={styles.avatar}
                        src={message.isUserMessage ? undefined : undefined}
                        alt={message.isUserMessage ? 'User' : 'AI'}
                      >
                        {message.isUserMessage ? (
                          <FiUser size={20} />
                        ) : (
                          <FiMessageCircle size={20} />
                        )}
                      </Avatar>
                      <Paper className={theme.colorScheme === 'dark' ? styles.paperMessageDark : styles.paperMessage}>
                        {message.text}
                      </Paper>
                    </Box>
                  </Box>
                ))}
                {isLoading && <Text>SummAIze bot is thinking{dots}</Text>}
              </Box>
              <Box className={styles.inputBox}>
                <Input
                  value={userInput}
                  onChange={handleInputChange}
                  onKeyDown={handleInputKeyPress}
                  className={styles.input}
                />
                <Button
                  onClick={handleMessageSubmit}
                  variant="light"
                  radius="xl"
                  className={styles.button}
                >
                  Send
                </Button>
              </Box>
            </Box>
          </Paper>
        </div>
      )}
    </>
  );
};

export default Chatbot;

interface Message {
  id: string;
  text: string;
  isUserMessage: boolean;
}
