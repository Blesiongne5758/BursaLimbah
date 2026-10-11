/**
 * Unit tests for UI components
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button, Badge, Card, Alert, ProgressStepper } from '../components/ui';
import { Skeleton } from '../components/Skeleton';

describe('UI Components', () => {
  describe('Button', () => {
    it('should render with children', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('should handle click events', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      
      fireEvent.click(screen.getByText('Click me'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should show loading state', () => {
      render(<Button loading>Loading</Button>);
      expect(screen.getByText('Loading')).toBeInTheDocument();
      // Should have loading spinner
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should apply variant classes', () => {
      const { rerender } = render(<Button variant="primary">Primary</Button>);
      expect(screen.getByText('Primary')).toHaveClass('bg-emerald-600');

      rerender(<Button variant="secondary">Secondary</Button>);
      expect(screen.getByText('Secondary')).toHaveClass('bg-slate-100');

      rerender(<Button variant="outline">Outline</Button>);
      expect(screen.getByText('Outline')).toHaveClass('border');
    });

    it('should apply size classes', () => {
      const { rerender } = render(<Button size="sm">Small</Button>);
      expect(screen.getByText('Small')).toHaveClass('text-xs');

      rerender(<Button size="md">Medium</Button>);
      expect(screen.getByText('Medium')).toHaveClass('text-sm');

      rerender(<Button size="lg">Large</Button>);
      expect(screen.getByText('Large')).toHaveClass('text-base');
    });
  });

  describe('Badge', () => {
    it('should render with children', () => {
      render(<Badge>Active</Badge>);
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should apply variant classes', () => {
      const { rerender } = render(<Badge variant="success">Success</Badge>);
      expect(screen.getByText('Success')).toHaveClass('bg-emerald-100');

      rerender(<Badge variant="warning">Warning</Badge>);
      expect(screen.getByText('Warning')).toHaveClass('bg-amber-100');

      rerender(<Badge variant="danger">Danger</Badge>);
      expect(screen.getByText('Danger')).toHaveClass('bg-red-100');
    });

    it('should apply size classes', () => {
      const { rerender } = render(<Badge size="xs">XS</Badge>);
      expect(screen.getByText('XS')).toHaveClass('text-[10px]');

      rerender(<Badge size="sm">SM</Badge>);
      expect(screen.getByText('SM')).toHaveClass('text-xs');

      rerender(<Badge size="md">MD</Badge>);
      expect(screen.getByText('MD')).toHaveClass('text-sm');
    });
  });

  describe('Card', () => {
    it('should render with children', () => {
      render(<Card>Card content</Card>);
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('should apply hover effect when hover prop is true', () => {
      render(<Card hover>Hoverable</Card>);
      const card = screen.getByText('Hoverable').closest('div');
      expect(card).toHaveClass('cursor-pointer');
    });

    it('should handle click events when onClick is provided', () => {
      const handleClick = vi.fn();
      render(<Card onClick={handleClick}>Clickable</Card>);
      
      fireEvent.click(screen.getByText('Clickable'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should apply custom className', () => {
      render(<Card className="custom-class">Content</Card>);
      const card = screen.getByText('Content').closest('div');
      expect(card).toHaveClass('custom-class');
    });
  });

  describe('Alert', () => {
    it('should render with children', () => {
      render(<Alert>Alert message</Alert>);
      expect(screen.getByText('Alert message')).toBeInTheDocument();
    });

    it('should render with title', () => {
      render(<Alert title="Alert Title">Alert message</Alert>);
      expect(screen.getByText('Alert Title')).toBeInTheDocument();
      expect(screen.getByText('Alert message')).toBeInTheDocument();
    });

    it('should apply type classes', () => {
      const { rerender } = render(<Alert type="info">Info</Alert>);
      expect(screen.getByText('Info').closest('div')).toHaveClass('bg-blue-50');

      rerender(<Alert type="success">Success</Alert>);
      expect(screen.getByText('Success').closest('div')).toHaveClass('bg-emerald-50');

      rerender(<Alert type="warning">Warning</Alert>);
      expect(screen.getByText('Warning').closest('div')).toHaveClass('bg-amber-50');

      rerender(<Alert type="error">Error</Alert>);
      expect(screen.getByText('Error').closest('div')).toHaveClass('bg-red-50');
    });

    it('should show close button when onClose is provided', () => {
      const handleClose = vi.fn();
      render(<Alert onClose={handleClose}>Closable</Alert>);
      
      const closeButton = screen.getByRole('button');
      fireEvent.click(closeButton);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('should not show close button when onClose is not provided', () => {
      render(<Alert>Not closable</Alert>);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('ProgressStepper', () => {
    it('should render all steps', () => {
      const steps = ['Step 1', 'Step 2', 'Step 3'];
      render(<ProgressStepper steps={steps} currentStep={0} />);
      
      steps.forEach(step => {
        expect(screen.getByText(step)).toBeInTheDocument();
      });
    });

    it('should highlight current step', () => {
      const steps = ['Step 1', 'Step 2', 'Step 3'];
      render(<ProgressStepper steps={steps} currentStep={1} />);
      
      // Step 1 should be completed (has check icon)
      const step1 = screen.getByText('Step 1').closest('div');
      expect(step1).toHaveClass('text-emerald-700');
      
      // Step 2 should be current
      const step2 = screen.getByText('Step 2').closest('div');
      expect(step2).toHaveClass('text-emerald-700');
      
      // Step 3 should be inactive
      const step3 = screen.getByText('Step 3').closest('div');
      expect(step3).toHaveClass('text-slate-400');
    });

    it('should show correct number of steps', () => {
      const steps = ['A', 'B', 'C', 'D'];
      render(<ProgressStepper steps={steps} currentStep={2} />);
      
      steps.forEach(step => {
        expect(screen.getByText(step)).toBeInTheDocument();
      });
    });
  });

  describe('Skeleton', () => {
    it('should render with default props', () => {
      render(<Skeleton />);
      const skeleton = document.querySelector('.animate-pulse');
      expect(skeleton).toBeInTheDocument();
    });

    it('should apply variant classes', () => {
      const { rerender } = render(<Skeleton variant="text" />);
      let skeleton = document.querySelector('.animate-pulse');
      expect(skeleton).toHaveClass('rounded');

      rerender(<Skeleton variant="circular" />);
      skeleton = document.querySelector('.animate-pulse');
      expect(skeleton).toHaveClass('rounded-full');

      rerender(<Skeleton variant="rectangular" />);
      skeleton = document.querySelector('.animate-pulse');
      expect(skeleton).not.toHaveClass('rounded');
    });

    it('should apply custom width and height', () => {
      render(<Skeleton width={200} height={100} />);
      const skeleton = document.querySelector('.animate-pulse');
      expect(skeleton).toHaveStyle({ width: '200px', height: '100px' });
    });

    it('should apply custom className', () => {
      render(<Skeleton className="custom-skeleton" />);
      const skeleton = document.querySelector('.animate-pulse');
      expect(skeleton).toHaveClass('custom-skeleton');
    });

    it('should apply animation classes', () => {
      const { rerender } = render(<Skeleton animation="pulse" />);
      let skeleton = document.querySelector('.animate-pulse');
      expect(skeleton).toBeInTheDocument();

      rerender(<Skeleton animation="wave" />);
      skeleton = document.querySelector('.animate-pulse');
      expect(skeleton).toBeInTheDocument();

      rerender(<Skeleton animation="none" />);
      skeleton = document.querySelector('.animate-pulse');
      expect(skeleton).not.toHaveClass('animate-pulse');
    });
  });
});
