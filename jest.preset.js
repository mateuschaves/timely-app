// This file runs BEFORE jest.setup.js to mock Expo modules early
// Mock expo/src/winter/runtime.native module before Expo tries to load it
jest.mock('expo/src/winter/runtime.native', () => ({}), { virtual: true });

// Mock styled-components/native to handle TouchableOpacity and ScrollView
jest.mock('styled-components/native', () => {
  const React = require('react');
  const RN = require('react-native');
  
  // Create a function that returns the component and adds styled-components API
  const createStyledComponent = (Component) => {
    const styledComponent = () => Component;
    styledComponent.attrs = () => styledComponent;
    styledComponent.withConfig = () => styledComponent;
    return styledComponent;
  };
  
  const styled = (component) => {
    return createStyledComponent(component);
  };
  
  // Add support for common React Native components
  styled.View = createStyledComponent(RN.View);
  styled.Text = createStyledComponent(RN.Text);
  styled.TouchableOpacity = createStyledComponent(RN.TouchableOpacity);
  styled.ScrollView = createStyledComponent(RN.ScrollView);
  styled.Image = createStyledComponent(RN.Image);
  styled.TextInput = createStyledComponent(RN.TextInput);
  
  // Mock ThemeProvider
  const ThemeProvider = ({ children, theme }) => React.createElement(React.Fragment, null, children);
  
  return {
    __esModule: true,
    default: styled,
    ThemeProvider: ThemeProvider,
  };
});

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
