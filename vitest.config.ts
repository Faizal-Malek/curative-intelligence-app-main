/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    // Test environment
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    
    // Test patterns
    include: [
      'src/**/*.{test,spec}.{js,ts,jsx,tsx}',
      '__tests__/**/*.{test,spec}.{js,ts,jsx,tsx}'
    ],
    exclude: [
      'node_modules',
      'dist',
      '.next',
      'coverage'
    ],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/lib/test-utils.ts',
        'src/**/*.d.ts',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        '__tests__/**/*',
        'coverage/**',
        'dist/**',
        '.next/**',
        '*.config.*',
        'src/app/globals.css'
      ],
      thresholds: {
        global: {
          branches: 75,
          functions: 75,
          lines: 75,
          statements: 75
        }
      }
    },

    // Test timeouts
    testTimeout: 10000,
    hookTimeout: 10000,

    // Watch mode configuration
    watch: false, // Set to true for development

    // Reporter configuration
    reporters: ['verbose'],
  },
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/app': path.resolve(__dirname, './src/app'),
      '@/types': path.resolve(__dirname, './src/types'),
    },
  },

  // Define global constants for testing
  define: {
    'process.env.NODE_ENV': JSON.stringify('test'),
  },
})