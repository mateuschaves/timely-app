/**
 * Type definitions para Reactotron
 */

declare global {
  interface Console {
    tron: {
      log: (...args: any[]) => void;
      warn: (...args: any[]) => void;
      error: (...args: any[]) => void;
      display: (config: {
        name: string;
        value: any;
        preview?: string;
        important?: boolean;
      }) => void;
      image: (config: { uri: string; preview?: string; filename?: string }) => void;
      clear?: () => void;
    };
  }
}

export {};

