import Chat from "../models/Chat.js";

export const createChat = async (req, res) => {
  const chat = await Chat.create({ participants: [req.user.userId, req.body.receiverId] });
  res.status(201).json(chat);
};

export const sendMessage = async (req, res) => {
  const chat = await Chat.findById(req.params.chatId);
  chat.messages.push({ sender: req.user.userId, text: req.body.text });
  await chat.save();
  res.status(200).json(chat);
};

export const getMessages = async (req, res) => {
  const chat = await Chat.findById(req.params.chatId);
  res.status(200).json(chat.messages);
};
