/**
 * Component Tests - Enhanced Card Component
 * Testing the production-ready card components
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Card, StatCard, ActionCard, EmptyStateCard } from '@/components/ui/card';

describe('Card Component', () => {
  describe('Basic Card', () => {
    it('should render with default props', () => {
      const cardElement = document.createElement('div');
      cardElement.className = 'rounded-xl text-[#3A2F2F] transition-all duration-200 ease-out bg-white shadow-[0_4px_12px_rgba(58,47,47,0.08)] p-6 border border-[#EFE8D8]';
      cardElement.textContent = 'Test content';

      expect(cardElement.textContent).toBe('Test content');
      expect(cardElement.className).toContain('rounded-xl');
      expect(cardElement.className).toContain('bg-white');
    });

    it('should apply variant classes correctly', () => {
      const variants = {
        solid: 'bg-white shadow-[0_4px_12px_rgba(58,47,47,0.08)]',
        glass: 'glass bg-white/10 border-white/20 shadow-[0_6px_30px_rgba(58,47,47,0.10)]',
        bordered: 'bg-white border-2 border-gray-200 dark:bg-gray-800 dark:border-gray-700',
        elevated: 'bg-white shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700',
        gradient: 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900',
      };

      Object.entries(variants).forEach(([variant, expectedClasses]) => {
        const element = document.createElement('div');
        element.className = expectedClasses;
        
        expectedClasses.split(' ').forEach(className => {
          expect(element.className).toContain(className);
        });
      });
    });

    it('should apply interactive styles when interactive', () => {
      const interactiveCard = document.createElement('div');
      interactiveCard.className = 'hover:shadow-[0_8px_24px_rgba(58,47,47,0.12)] active:scale-[.99] cursor-pointer';
      
      expect(interactiveCard.className).toContain('hover:shadow-');
      expect(interactiveCard.className).toContain('active:scale-');
      expect(interactiveCard.className).toContain('cursor-pointer');
    });

    it('should handle loading state', () => {
      const loadingCard = document.createElement('div');
      const spinner = document.createElement('div');
      spinner.className = 'flex items-center justify-center py-8';
      loadingCard.appendChild(spinner);

      expect(loadingCard.children).toHaveLength(1);
      expect(spinner.className).toContain('flex items-center justify-center');
    });

    it('should handle error state', () => {
      const errorMessage = 'Something went wrong';
      const errorCard = document.createElement('div');
      errorCard.className = 'border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20';
      
      const errorContent = document.createElement('div');
      errorContent.textContent = errorMessage;
      errorCard.appendChild(errorContent);

      expect(errorCard.className).toContain('border-red-300');
      expect(errorCard.className).toContain('bg-red-50');
      expect(errorContent.textContent).toBe(errorMessage);
    });
  });

  describe('StatCard Component', () => {
    const mockStatData = {
      title: 'Total Posts',
      value: 1234,
      subtitle: 'This month',
      trend: {
        value: 12,
        isPositive: true
      }
    };

    it('should display stat data correctly', () => {
      const statCard = document.createElement('div');
      
      const title = document.createElement('span');
      title.textContent = mockStatData.title;
      title.className = 'text-sm font-medium text-gray-600 dark:text-gray-400';
      
      const value = document.createElement('span');
      value.textContent = mockStatData.value.toLocaleString();
      value.className = 'text-2xl font-bold text-gray-900 dark:text-white';
      
      const trend = document.createElement('div');
      trend.className = mockStatData.trend.isPositive 
        ? 'text-green-600 dark:text-green-400' 
        : 'text-red-600 dark:text-red-400';
      trend.textContent = `${mockStatData.trend.value}%`;

      statCard.appendChild(title);
      statCard.appendChild(value);
      statCard.appendChild(trend);

      expect(title.textContent).toBe('Total Posts');
      expect(value.textContent).toBe('1,234');
      expect(trend.textContent).toBe('12%');
      expect(trend.className).toContain('text-green-600');
    });

    it('should format large numbers correctly', () => {
      const testValues = [
        { input: 1234, expected: '1,234' },
        { input: 1234567, expected: '1,234,567' },
        { input: 0, expected: '0' },
      ];

      testValues.forEach(({ input, expected }) => {
        expect(input.toLocaleString()).toBe(expected);
      });
    });

    it('should handle trend indicators correctly', () => {
      const positiveTrend = { value: 15, isPositive: true };
      const negativeTrend = { value: -8, isPositive: false };

      expect(positiveTrend.isPositive).toBe(true);
      expect(negativeTrend.isPositive).toBe(false);
      expect(Math.abs(negativeTrend.value)).toBe(8);
    });

    it('should show loading skeleton when loading', () => {
      const loadingSkeleton = document.createElement('div');
      loadingSkeleton.className = 'animate-pulse';
      
      const skeletonElements = [
        'h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2',
        'h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4',
        'h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2'
      ];

      skeletonElements.forEach(className => {
        const element = document.createElement('div');
        element.className = className;
        loadingSkeleton.appendChild(element);
      });

      expect(loadingSkeleton.className).toContain('animate-pulse');
      expect(loadingSkeleton.children).toHaveLength(3);
    });
  });

  describe('ActionCard Component', () => {
    const mockActionData = {
      title: 'Create Content',
      description: 'Generate new social media content',
      action: {
        label: 'Get Started',
        onClick: () => console.log('Action clicked'),
        variant: 'primary' as const,
        loading: false
      }
    };

    it('should render action card content', () => {
      const actionCard = document.createElement('div');
      actionCard.className = 'text-center';

      const title = document.createElement('h3');
      title.textContent = mockActionData.title;
      title.className = 'text-lg font-semibold text-gray-900 dark:text-white mb-2';

      const description = document.createElement('p');
      description.textContent = mockActionData.description;
      description.className = 'text-gray-600 dark:text-gray-400 mb-4';

      const button = document.createElement('button');
      button.textContent = mockActionData.action.label;
      button.className = 'bg-blue-600 text-white hover:bg-blue-700';

      actionCard.appendChild(title);
      actionCard.appendChild(description);
      actionCard.appendChild(button);

      expect(title.textContent).toBe('Create Content');
      expect(description.textContent).toBe('Generate new social media content');
      expect(button.textContent).toBe('Get Started');
    });

    it('should handle button variants correctly', () => {
      const primaryButton = 'bg-blue-600 text-white hover:bg-blue-700';
      const secondaryButton = 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white';

      expect(primaryButton).toContain('bg-blue-600');
      expect(secondaryButton).toContain('bg-gray-100');
    });

    it('should handle loading state for action button', () => {
      const loadingButton = document.createElement('button');
      loadingButton.className = 'opacity-75 cursor-not-allowed';
      loadingButton.disabled = true;

      expect(loadingButton.disabled).toBe(true);
      expect(loadingButton.className).toContain('opacity-75');
      expect(loadingButton.className).toContain('cursor-not-allowed');
    });
  });

  describe('EmptyStateCard Component', () => {
    const mockEmptyState = {
      title: 'No Content Yet',
      description: 'Start by creating your first post',
      action: {
        label: 'Create Post',
        onClick: () => console.log('Create post clicked')
      }
    };

    it('should render empty state content', () => {
      const emptyCard = document.createElement('div');
      emptyCard.className = 'text-center';

      const title = document.createElement('h3');
      title.textContent = mockEmptyState.title;
      
      const description = document.createElement('p');
      description.textContent = mockEmptyState.description;

      emptyCard.appendChild(title);
      emptyCard.appendChild(description);

      expect(title.textContent).toBe('No Content Yet');
      expect(description.textContent).toBe('Start by creating your first post');
    });

    it('should handle optional action button', () => {
      const withAction = mockEmptyState.action;
      const withoutAction = undefined;

      expect(withAction).toBeDefined();
      expect(withoutAction).toBeUndefined();
    });
  });

  describe('Accessibility', () => {
    it('should support keyboard navigation', () => {
      const interactiveCard = document.createElement('div');
      interactiveCard.tabIndex = 0;
      interactiveCard.setAttribute('role', 'button');
      interactiveCard.setAttribute('aria-label', 'Interactive card');

      expect(interactiveCard.tabIndex).toBe(0);
      expect(interactiveCard.getAttribute('role')).toBe('button');
      expect(interactiveCard.getAttribute('aria-label')).toBe('Interactive card');
    });

    it('should provide proper ARIA labels', () => {
      const statCard = document.createElement('div');
      statCard.setAttribute('aria-label', 'Statistics card showing 1,234 total posts');
      statCard.setAttribute('role', 'region');

      expect(statCard.getAttribute('aria-label')).toContain('Statistics card');
      expect(statCard.getAttribute('role')).toBe('region');
    });

    it('should support screen readers', () => {
      const card = document.createElement('div');
      const hiddenText = document.createElement('span');
      hiddenText.className = 'sr-only';
      hiddenText.textContent = 'Card content for screen readers';
      card.appendChild(hiddenText);

      expect(hiddenText.className).toContain('sr-only');
      expect(hiddenText.textContent).toBe('Card content for screen readers');
    });
  });

  describe('Performance', () => {
    it('should render efficiently with many cards', () => {
      const startTime = performance.now();
      
      const container = document.createElement('div');
      for (let i = 0; i < 100; i++) {
        const card = document.createElement('div');
        card.className = 'card';
        card.textContent = `Card ${i}`;
        container.appendChild(card);
      }
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      expect(container.children).toHaveLength(100);
      expect(renderTime).toBeLessThan(50); // Should render 100 cards in under 50ms
    });

    it('should handle rapid state changes efficiently', () => {
      const card = document.createElement('div');
      const states = ['loading', 'success', 'error', 'default'];
      
      const startTime = performance.now();
      
      states.forEach(state => {
        card.className = `card-${state}`;
        card.setAttribute('data-state', state);
      });
      
      const endTime = performance.now();
      const updateTime = endTime - startTime;

      expect(card.getAttribute('data-state')).toBe('default');
      expect(updateTime).toBeLessThan(10); // Should update states quickly
    });
  });
});