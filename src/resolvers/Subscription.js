function newMessageSubscribe(parent, args, context, info) {
  console.log(args.conversationId);

  return context.prisma.$subscribe
    .message({
      mutation_in: ['CREATED'],
      conversation: { id: args.conversationId },
    })
    .node();
}

const newMessage = {
  subscribe: newMessageSubscribe,
  resolve: (payload) => {
    return payload;
  },
};

module.exports = {
  newMessage,
};
