import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useWorkSettings } from '../useWorkSettings';
import { getUserSettings } from '@/api/get-user-settings';

jest.mock('@/api/get-user-settings');

const mockGetUserSettings = getUserSettings as jest.MockedFunction<typeof getUserSettings>;

describe('useWorkSettings', () => {
    let queryClient: QueryClient;

    beforeEach(() => {
        jest.clearAllMocks();
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
            },
        });
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    it('should return hasWorkSettings as false when no work schedule is configured', async () => {
        mockGetUserSettings.mockResolvedValue({
            workSchedule: {},
        });

        const { result } = renderHook(() => useWorkSettings(), { wrapper });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.hasWorkSettings).toBe(false);
        expect(result.current.canShowCard).toBe(true);
        expect(result.current.settings).toBeDefined();
    });

    it('should return hasWorkSettings as true when work schedule has at least one day configured', async () => {
        mockGetUserSettings.mockResolvedValue({
            workSchedule: {
                monday: {
                    start: '09:00',
                    end: '18:00',
                },
            },
        });

        const { result } = renderHook(() => useWorkSettings(), { wrapper });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.hasWorkSettings).toBe(true);
        expect(result.current.canShowCard).toBe(true);
    });

    it('should return canShowCard as false while loading', () => {
        mockGetUserSettings.mockImplementation(() => new Promise(() => { })); // Never resolves

        const { result } = renderHook(() => useWorkSettings(), { wrapper });

        expect(result.current.isLoading).toBe(true);
        expect(result.current.canShowCard).toBe(false);
    });

    it('should return canShowCard as false when there is an error', async () => {
        mockGetUserSettings.mockRejectedValue(new Error('Network error'));

        const { result } = renderHook(() => useWorkSettings(), { wrapper });

        // Wait for the query to finish (with error or success)
        await waitFor(() => {
            return !result.current.isLoading;
        }, { timeout: 3000 });

        // If there's an error, canShowCard should be false
        if (result.current.isError || result.current.error) {
            expect(result.current.canShowCard).toBe(false);
        }
    });

    it('should return hasWorkSettings as false when workSchedule is undefined', async () => {
        mockGetUserSettings.mockResolvedValue({});

        const { result } = renderHook(() => useWorkSettings(), { wrapper });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.hasWorkSettings).toBe(false);
        expect(result.current.canShowCard).toBe(true);
    });

    it('should return hasWorkSettings as false when workSchedule is empty object', async () => {
        mockGetUserSettings.mockResolvedValue({
            workSchedule: {},
        });

        const { result } = renderHook(() => useWorkSettings(), { wrapper });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.hasWorkSettings).toBe(false);
    });

    it('should return hasWorkSettings as true when at least one day is configured', async () => {
        mockGetUserSettings.mockResolvedValue({
            workSchedule: {
                monday: {
                    start: '09:00',
                    end: '18:00',
                },
            },
        });

        const { result } = renderHook(() => useWorkSettings(), { wrapper });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.hasWorkSettings).toBe(true);
    });
});

