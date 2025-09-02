import React, { useContext, useEffect, useRef, useState } from 'react'
import assets from '../assets/assets'
import { formatMessageTime } from '../lib/utils.js'
import { ChatContext } from '../../context/ChatContext.jsx'
import { AuthContext } from '../../context/AuthContext.jsx'
import toast from 'react-hot-toast'

const ChatContainer = () => {
  const { messages, selectedUser, setSelectedUser, sendMessage, getMessages } = useContext(ChatContext)
  const { authUser, onlineUsers } = useContext(AuthContext)

  const scrollEnd = useRef(null)
  const [input, setInput] = useState('')

  // 1) Guard: never allow self-selection
  useEffect(() => {
    if (selectedUser && authUser && selectedUser._id === authUser._id) {
      setSelectedUser(null)
    }
  }, [selectedUser?._id, authUser?._id])

  // 2) Send text to the correct receiver
  const handleSendMessage = async (e) => {
    e?.preventDefault?.()
    const text = input.trim()
    if (!text || !selectedUser || selectedUser._id === authUser._id) return
    await sendMessage({ text, receiverId: selectedUser._id })
    setInput('')
  }

  // 2) Send images to the correct receiver
  const handleSendImage = async (e) => {
    const file = e.target.files[0]
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Select an image file')
      return
    }
    if (!selectedUser || selectedUser._id === authUser._id) return

    const reader = new FileReader()
    reader.onloadend = async () => {
      await sendMessage({ image: reader.result, receiverId: selectedUser._id })
      e.target.value = ''
    }
    reader.readAsDataURL(file)
  }

  // 3) Only fetch messages for other users
  useEffect(() => {
    if (selectedUser && selectedUser._id !== authUser?._id) {
      getMessages(selectedUser._id)
    }
  }, [selectedUser?._id, authUser?._id])

  useEffect(() => {
    if (scrollEnd.current) scrollEnd.current.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!selectedUser) {
    return (
      <div className='flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden'>
        <img src={assets.logo_icon} className='max-w-16' alt='' />
        <p className='text-lg font-medium text-white'>Chat anytime, anywhere</p>
      </div>
    )
  }

  return (
    <div className='h-full overflow-scroll relative backdrop-blur-lg'>
      {/* HEADER */}
      <div className='flex items-center gap-3 py-3 mx-4 border-b border-stone-500'>
        <img src={selectedUser.profilePic || assets.avatar_icon} alt='' className='w-8 rounded-full' />
        <p className='flex-1 text-lg text-white flex items-center gap-2'>
          {selectedUser.fullName}
          {onlineUsers.includes(selectedUser._id) && <span className='w-2 h-2 rounded-full bg-green-500'></span>}
        </p>
        <img onClick={() => setSelectedUser(null)} src={assets.arrow_icon} alt='' className='md:hidden max-w-7' />
        <img src={assets.help_icon} className='max-md-hidden max-w-5' alt='' />
      </div>

      {/* CHAT AREA */}
      <div className='flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6'>
        {messages.map((msg, index) => {
          const isOwn = msg.senderId === authUser?._id
          return (
            <div key={index} className={`flex items-end gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
              {!isOwn && (
                <img src={selectedUser?.profilePic || assets.avatar_icon} alt='' className='w-7 rounded-full' />
              )}

              {msg.image ? (
                <img
                  src={msg.image}
                  alt=''
                  className='max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-2'
                />
              ) : (
                <p
                  className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg mb-2 break-all text-white
                    ${isOwn ? 'bg-violet-500/30 rounded-br-none' : 'bg-white/10 rounded-bl-none'}`}  // <- fixed typo
                >
                  {msg.text}
                </p>
              )}

              {isOwn && (
                <img src={authUser?.profilePic || assets.avatar_icon} alt='' className='w-7 rounded-full' />
              )}

              <span className='text-gray-500 text-xs'>{formatMessageTime(msg.createdAt)}</span>
            </div>
          )
        })}
        <div ref={scrollEnd}></div>
      </div>

      {/* BOTTOM AREA */}
      <div className='absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3'>
        <div className='flex-1 flex items-center bg-gray-100/12 px-3 rounded-full'>
          <input
            onChange={(e) => setInput(e.target.value)}
            value={input}
            onKeyDown={(e) => (e.key === 'Enter' ? handleSendMessage(e) : null)}
            type='text'
            placeholder='Send a message'
            className='flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400'
          />
          <input onChange={handleSendImage} type='file' id='image' accept='image/png, image/jpeg' hidden />
          <label htmlFor='image'>
            <img src={assets.gallery_icon} alt='' className='w-5 mr-2 cursor-pointer' />
          </label>
        </div>

        <img onClick={handleSendMessage} src={assets.send_button} alt='' className='w-7 cursor-pointer' />
      </div>
    </div>
  )
}

export default ChatContainer
