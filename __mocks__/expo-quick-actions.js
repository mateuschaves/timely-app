module.exports = {
  setItems: jest.fn(),
  addListener: jest.fn(() => ({ remove: jest.fn() })),
};
