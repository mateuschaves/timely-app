// This file runs BEFORE jest.setup.js to mock Expo modules early
// Mock expo/src/winter/runtime.native module before Expo tries to load it
jest.mock('expo/src/winter/runtime.native', () => ({}), { virtual: true });

// Mock TextDecoder and TextEncoder (Node.js built-in)
if (typeof global.TextDecoder === 'undefined') {
  try {
    const { TextDecoder: NodeTextDecoder, TextEncoder: NodeTextEncoder } = require('util');
    global.TextDecoder = NodeTextDecoder;
    global.TextEncoder = NodeTextEncoder;
  } catch (e) {
    // Fallback if util is not available
    global.TextDecoder = class TextDecoder {
      decode(input) { return String(input); }
    };
    global.TextEncoder = class TextEncoder {
      encode(input) { return Buffer.from(String(input)); }
    };
  }
}

// Mock TextDecoderStream and other Web APIs that Expo tries to use
if (typeof global.TextDecoderStream === 'undefined') {
  global.TextDecoderStream = class TextDecoderStream {};
}
if (typeof global.TextEncoderStream === 'undefined') {
  global.TextEncoderStream = class TextEncoderStream {};
}

// Mock structuredClone (Node.js < 17 doesn't have it)
if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = function(obj) {
    return JSON.parse(JSON.stringify(obj));
  };
}

// Mock __ExpoImportMetaRegistry before Expo tries to use it
global.__ExpoImportMetaRegistry = new Map();
