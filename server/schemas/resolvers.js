const { AuthenticationError } = require('apollo-server-express');
const {  User, Book } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
      me: async (_, __, context) => {
        if (context.user) {
          const userData = await User.findOne({ _id: context.user._id })
            .select('-__v -password')
            .populate('savedBooks');
  
          return userData;
        }
  
        throw new AuthenticationError('Not logged in');
      },
    },
    Mutation: {
      login: async (_, { email, password }) => {
        const user = await User.findOne({ email });
  
        if (!user) {
          throw new AuthenticationError('Incorrect credentials');
        }
  
        const correctPw = await user.isCorrectPassword(password);
  
        if (!correctPw) {
          throw new AuthenticationError('Incorrect credentials');
        }
  
        const token = signToken(user);
        return { token, user };
      },
      addUser: async (_, { username, email, password }) => {
        const user = await User.create({ username, email, password });
        const token = signToken(user);
        return { token, user };
      },
      saveBook: async (_, { input }, context) => {
        if (context.user) {
          const updatedUser = await User.findByIdAndUpdate(
            context.user._id,
            { $push: { savedBooks: input } },
            { new: true }
          ).populate('savedBooks');
  
          return updatedUser;
        }
  
        throw new AuthenticationError('You need to be logged in to save a book');
      },
      removeBook: async (_, { bookId }, context) => {
        if (context.user) {
          const updatedUser = await User.findByIdAndUpdate(
            context.user._id,
            { $pull: { savedBooks: { bookId } } },
            { new: true }
          ).populate('savedBooks');
  
          return updatedUser;
        }
  
        throw new AuthenticationError('You need to be logged in to remove a book');
      },
    },
  };
  
module.exports = resolvers;