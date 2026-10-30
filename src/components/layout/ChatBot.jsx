import { useEffect, useRef, useState } from 'react'
import { postRequest } from '../../service/apiService'

const WELCOME_MESSAGE = {
  id: 1,
  sender: 'bot',
  text: 'Hi! I am the AI Safety Assistant. How can I help you today?',
}

export const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([WELCOME_MESSAGE])
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)
  const messagesRef = useRef(null)

  useEffect(() => {
    if (isOpen) inputRef.current?.focus()
  }, [isOpen])

  useEffect(() => {
    const container = messagesRef.current
    if (container) container.scrollTop = container.scrollHeight
  }, [messages, isSending])

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [])

  const sendMessage = async (event) => {
    event.preventDefault()
    const text = message.trim()
    if (!text || isSending) return

    setMessages((current) => [...current, { id: Date.now(), sender: 'user', text }])
    setMessage('')
    setError('')
    setIsSending(true)

    try {
      const result = await postRequest('/api/chat', { message: text })
      if (typeof result?.response !== 'string' || !result.response.trim()) {
        throw new Error('The safety assistant returned an invalid response.')
      }
      setMessages((current) => [...current, { id: Date.now() + 1, sender: 'bot', text: result.response }])
    } catch (requestError) {
      console.error('Safety chat request failed:', requestError)
      setError(requestError.status === 404
        ? 'The chat endpoint was not found on this backend. It must expose POST /api/chat.'
        : requestError.message || 'The chat request failed. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="chatBot-wp">
      {isOpen && (
        <section id="chatbot-panel" className="chatBot-panel" aria-label="AI Safety Assistant chat">
          <div className="chatBot-header">
            <div>
              <strong>AI Safety Assistant</strong>
              <span>Online</span>
            </div>
            <button type="button" className="chatBot-close" onClick={() => setIsOpen(false)} aria-label="Close chat">
              &times;
            </button>
          </div>

          <div ref={messagesRef} className="chatBot-messages" aria-live="polite">
            {messages.map((chatMessage) => (
              <p key={chatMessage.id} className={`chatBot-message ${chatMessage.sender}`}>
                {chatMessage.text}
              </p>
            ))}
            {isSending && <p className="chatBot-message bot chatBot-typing">Typing...</p>}
            {error && <p className="chatBot-error" role="alert">{error}</p>}
          </div>

          <form className="chatBot-form" onSubmit={sendMessage}>
            <label className="sr-only" htmlFor="chatbot-message">Type your message</label>
            <input
              ref={inputRef}
              id="chatbot-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Type a message..."
              autoComplete="off"
              maxLength={4000}
              disabled={isSending}
            />
            <button type="submit" aria-label="Send message" disabled={isSending || !message.trim()}>
              {isSending ? 'Sending...' : 'Send'}
            </button>
          </form>
        </section>
      )}

      {!isOpen && <div className="title-wp-chat">I'm here to help!</div>}
      <button
        type="button"
        className="open-button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls="chatbot-panel"
        aria-label={isOpen ? 'Close AI Safety Assistant chat' : 'Open AI Safety Assistant chat'}
      >
        <img src="/images/chatbot-icon.svg" alt="" />
      </button>
    </div>
  )
}
