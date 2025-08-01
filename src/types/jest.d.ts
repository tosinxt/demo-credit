// Minimal Jest type definitions
declare namespace jest {
  interface Mock<T = any> {
    (...args: any[]): any;
    mock: {
      calls: any[][];
      results: Array<{ type: string; value: any }>;
      instances: any[];
    };
    mockClear(): void;
    mockReset(): void;
    mockImplementation(fn: (...args: any[]) => any): Mock;
    mockImplementationOnce(fn: (...args: any[]) => any): Mock;
    mockReturnThis(): Mock;
    mockReturnValue(value: any): Mock;
    mockReturnValueOnce(value: any): Mock;
    mockResolvedValue(value: any): Mock;
    mockResolvedValueOnce(value: any): Mock;
    mockRejectedValue(value: any): Mock;
    mockRejectedValueOnce(value: any): Mock;
  }

  interface MockInstance<T = any> {
    mock: Mock;
    mockClear(): void;
    mockReset(): void;
    mockRestore(): void;
  }

  interface MockFunctionProperties {
    [key: string]: any;
  }

  interface MockFunction<T = any> extends Mock, MockFunctionProperties {}

  function fn<T extends (...args: any[]) => any>(
    implementation?: T
  ): Mock<ReturnType<T>, Parameters<T>>;

  function spyOn<T extends object, K extends keyof T>(
    object: T,
    method: K,
    accessType: 'get' | 'set'
  ): MockInstance<T[K]>;

  function spyOn<T extends object, K extends keyof T>(
    object: T,
    method: K
  ): T[K] extends (...args: any[]) => any ? MockInstance<T[K]> : never;

  function clearAllMocks(): void;
  function resetAllMocks(): void;
  function restoreAllMocks(): void;
  function isMockFunction(fn: any): fn is Mock;
  function setMock(moduleName: string, moduleExports: any): void;
  function requireActual(moduleName: string): any;
  function requireMock(moduleName: string): any;
  function resetModules(): void;
  function enableAutomock(): typeof jest;
  function disableAutomock(): typeof jest;
  function useFakeTimers(implementation?: 'modern' | 'legacy'): typeof jest;
  function useRealTimers(): typeof jest;
  function isolateModules(fn: () => void): typeof jest;
  function retryTimes(numRetries: number): typeof jest;
  function setSystemTime(now?: number | Date): void;
  function getRealSystemTime(): number;
  function getTimerCount(): number;
  function runAllTicks(): void;
  function runAllTimers(): void;
  function runAllImmediates(): void;
  function advanceTimersByTime(msToRun: number): void;
  function advanceTimersToNextTimer(steps?: number): void;
  function runOnlyPendingTimers(): void;
  function runTimersToTime(msToRun: number): void;
  function getTimerTime(): number;
  function clearAllTimers(): void;
  function getSeed(): number;
  function isEnvironmentTornDown(): boolean;
  function retryTimes(numRetries: number): typeof jest;
  function setTimeout(timeout: number): typeof jest;
  function setSystemTime(now?: number | Date): void;
  function getRealSystemTime(): number;
  function isMockFunction(fn: any): fn is Mock;
  function fn<T = any>(implementation?: (...args: any[]) => any): Mock<T>;
  function spyOn<T extends object, K extends keyof T>(
    object: T,
    method: K,
    accessType: 'get' | 'set'
  ): MockInstance<T[K]>;
  function spyOn<T extends object, K extends keyof T>(
    object: T,
    method: K
  ): T[K] extends (...args: any[]) => any ? MockInstance<T[K]> : never;
  function clearAllMocks(): void;
  function resetAllMocks(): void;
  function restoreAllMocks(): void;
  function isMockFunction(fn: any): fn is Mock;
  function setMock(moduleName: string, moduleExports: any): void;
  function requireActual(moduleName: string): any;
  function requireMock(moduleName: string): any;
  function resetModules(): void;
  function enableAutomock(): typeof jest;
  function disableAutomock(): typeof jest;
  function useFakeTimers(implementation?: 'modern' | 'legacy'): typeof jest;
  function useRealTimers(): typeof jest;
  function isolateModules(fn: () => void): typeof jest;
  function retryTimes(numRetries: number): typeof jest;
  function setSystemTime(now?: number | Date): void;
  function getRealSystemTime(): number;
  function getTimerCount(): number;
  function runAllTicks(): void;
  function runAllTimers(): void;
  function runAllImmediates(): void;
  function advanceTimersByTime(msToRun: number): void;
  function advanceTimersToNextTimer(steps?: number): void;
  function runOnlyPendingTimers(): void;
  function runTimersToTime(msToRun: number): void;
  function getTimerTime(): number;
  function clearAllTimers(): void;
  function getSeed(): number;
  function isEnvironmentTornDown(): boolean;
  function retryTimes(numRetries: number): typeof jest;
  function setTimeout(timeout: number): typeof jest;
  function setSystemTime(now?: number | Date): void;
  function getRealSystemTime(): number;
}
