module.exports = {
  ['/']({ res }) {
    res.send({
      result: 100,
      data: 'hello world',
    });
  },
};
