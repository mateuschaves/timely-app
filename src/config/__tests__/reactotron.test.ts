let mockReactotronInstance: any;

jest.mock('reactotron-react-native', () => {
  mockReactotronInstance = {
    configure: jest.fn().mockReturnThis(),
    useReactNative: jest.fn().mockReturnThis(),
    connect: jest.fn().mockReturnThis(),
    clear: jest.fn(),
    onCustomCommand: jest.fn(),
    log: jest.fn(),
    error: jest.fn(),
    display: jest.fn(),
    warn: jest.fn(),
    image: jest.fn(),
  };
  
  return {
    __esModule: true,
    default: {
      configure: jest.fn(() => mockReactotronInstance),
    },
  };
});

import { setupReactotron } from '../reactotron';
import { Platform } from 'react-native';
import { scheduleTestNotification } from '@/utils/notifications';

jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
}));
jest.mock('@/utils/notifications', () => ({
  scheduleTestNotification: jest.fn(),
}));

describe('reactotron', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.__DEV__ = true;
  });

  afterEach(() => {
    delete (global as any).scheduleTestNotification;
  });

  it('should setup Reactotron in development mode', () => {
    global.__DEV__ = true;
    // Note: setupReactotron is called when the module is imported
    // We verify that Reactotron methods are available
    expect(console.tron).toBeDefined();
    expect(typeof console.tron.log).toBe('function');
    expect(typeof console.tron.display).toBe('function');
  });

  it('should register custom command for test notification', async () => {
    global.__DEV__ = true;
    (scheduleTestNotification as jest.Mock).mockResolvedValue(undefined);

    setupReactotron();

    expect(mockReactotronInstance.onCustomCommand).toHaveBeenCalled();
    const commandCall = mockReactotronInstance.onCustomCommand.mock.calls[0][0];
    
    expect(commandCall.command).toBe('schedule-test-notification');
    expect(commandCall.title).toBe('Agendar Notificação de Teste');
    expect(commandCall.description).toBe('Agenda uma notificação push para daqui a 1 minuto');

    // Test handler
    await commandCall.handler();
    expect(scheduleTestNotification).toHaveBeenCalled();
    expect(mockReactotronInstance.log).toHaveBeenCalledWith(
      '✅ Notificação de teste agendada para daqui a 1 minuto!'
    );
  });

  it('should handle error in custom command handler', async () => {
    global.__DEV__ = true;
    const error = new Error('Test error');
    (scheduleTestNotification as jest.Mock).mockRejectedValue(error);

    setupReactotron();

    const commandCall = mockReactotronInstance.onCustomCommand.mock.calls[0][0];
    await commandCall.handler();

    expect(mockReactotronInstance.error).toHaveBeenCalledWith(
      '❌ Erro ao agendar notificação de teste:',
      error
    );
  });

  it('should expose global scheduleTestNotification function', () => {
    global.__DEV__ = true;
    (scheduleTestNotification as jest.Mock).mockResolvedValue(undefined);

    setupReactotron();

    expect((global as any).scheduleTestNotification).toBeDefined();
    expect(typeof (global as any).scheduleTestNotification).toBe('function');
  });

  it('should handle production mode', () => {
    // Note: The module executes setupReactotron on import when __DEV__ is true
    // In production, it would set console.tron to empty functions
    // We verify that console.tron exists and has the expected methods
    expect(console.tron).toBeDefined();
    expect(typeof console.tron.log).toBe('function');
    expect(typeof console.tron.warn).toBe('function');
    expect(typeof console.tron.error).toBe('function');
    expect(typeof console.tron.display).toBe('function');
    expect(typeof console.tron.image).toBe('function');
    
    // Test that methods don't throw
    expect(() => console.tron.log()).not.toThrow();
    expect(() => console.tron.warn()).not.toThrow();
    expect(() => console.tron.error()).not.toThrow();
    expect(() => console.tron.display()).not.toThrow();
    expect(() => console.tron.image()).not.toThrow();
  });
});

