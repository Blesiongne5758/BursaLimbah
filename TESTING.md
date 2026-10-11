# 🧪 Testing Guide - BursaLimbah.com

## Overview

BursaLimbah.com menggunakan **Vitest** untuk unit testing dan **React Testing Library** untuk component testing.

## 📊 Test Coverage

### Current Coverage
- **Security Utilities**: ✅ 100% (email, phone, NPWP, NIK validation, password strength, rate limiter)
- **Form Validators**: ✅ 100% (login, register, listing, booking, KYC schemas)
- **Custom Hooks**: 🔄 In Progress
- **Components**: 🔄 Planned
- **Pages**: 🔄 Planned

### Target Coverage
- **Unit Tests**: 80%+ coverage
- **Integration Tests**: Critical user flows
- **E2E Tests**: Playwright (planned)

## 🚀 Running Tests

### Run All Tests
```bash
npx vitest
```

### Run Tests in Watch Mode
```bash
npx vitest watch
```

### Run Tests with Coverage
```bash
npx vitest run --coverage
```

### Run Specific Test File
```bash
npx vitest src/test/security.test.ts
```

### Run Tests in UI Mode
```bash
npx vitest --ui
```

## 📁 Test Structure

```
src/test/
├── setup.ts                 # Test setup (jest-dom matchers)
├── security.test.ts         # Security utilities tests
├── validators.test.ts       # Form validation tests
├── hooks.test.ts            # Custom hooks tests (planned)
└── components/              # Component tests (planned)
    ├── ErrorBoundary.test.tsx
    ├── Skeleton.test.tsx
    └── SEO.test.tsx
```

## 📝 Writing Tests

### Unit Test Example
```typescript
import { describe, it, expect } from 'vitest';
import { isValidEmail } from '../lib/security';

describe('isValidEmail', () => {
  it('should validate correct email', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
  });

  it('should reject invalid email', () => {
    expect(isValidEmail('invalid')).toBe(false);
  });
});
```

### Component Test Example
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '../components/ui';

describe('Button', () => {
  it('should render with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should handle click', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await userEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Hook Test Example
```typescript
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../hooks';

describe('useDebounce', () => {
  it('should debounce value', async () => {
    const { result } = renderHook(() => useDebounce('test', 300));
    
    expect(result.current).toBe('test');
    
    act(() => {
      result.current = 'new value';
    });
    
    // Value should not change immediately
    expect(result.current).toBe('test');
    
    // Wait for debounce
    await new Promise(resolve => setTimeout(resolve, 350));
    expect(result.current).toBe('new value');
  });
});
```

## 🎯 Test Categories

### 1. Security Tests (`security.test.ts`)
- ✅ Email validation
- ✅ Phone validation (Indonesian format)
- ✅ NPWP validation
- ✅ NIK validation
- ✅ Password strength checker
- ✅ HTML sanitization
- ✅ Rate limiter

### 2. Validator Tests (`validators.test.ts`)
- ✅ Login schema validation
- ✅ Registration schema validation
- ✅ Listing schema validation
- ✅ Booking schema validation
- ✅ KYC KTP schema validation
- ✅ Form validation helper

### 3. Hook Tests (Planned)
- 🔄 useDebounce
- 🔄 useFilteredListings
- 🔄 useLocalStorage
- 🔄 useIntersectionObserver
- 🔄 useMediaQuery
- 🔄 useCopyToClipboard
- 🔄 useCountdown
- 🔄 useClickOutside
- 🔄 useKeyboardShortcut

### 4. Component Tests (Planned)
- 🔄 ErrorBoundary
- 🔄 Skeleton components
- 🔄 SEO component
- 🔄 UI components (Button, Card, Badge, etc.)

### 5. Integration Tests (Planned)
- 🔄 Login flow
- 🔄 Listing creation flow
- 🔄 Booking flow
- 🔄 Payment flow
- 🔄 KYC verification flow

### 6. E2E Tests (Planned - Playwright)
- 🔄 User registration
- 🌓 Listing browsing
- 🔄 Booking & payment
- 🔄 AI chat interaction
- 🔄 Admin moderation

## 🔧 Test Configuration

### Vitest Config (`vitest.config.ts`)
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'html'],
    },
  },
});
```

### Setup File (`src/test/setup.ts`)
```typescript
import '@testing-library/jest-dom';
```

## 📊 Coverage Report

After running tests with coverage:
```bash
npx vitest run --coverage
```

Coverage report will be generated in `coverage/` directory:
- `coverage/index.html` - Interactive HTML report
- `coverage/coverage-final.json` - JSON report
- `coverage/lcov-report/` - LCOV report

## 🎓 Best Practices

### 1. Test Behavior, Not Implementation
```typescript
// ❌ Bad: Testing implementation details
expect(component.state.count).toBe(5);

// ✅ Good: Testing behavior
expect(screen.getByText('Count: 5')).toBeInTheDocument();
```

### 2. Use Descriptive Test Names
```typescript
// ❌ Bad
it('works', () => { ... });

// ✅ Good
it('should validate email format correctly', () => { ... });
```

### 3. Test Edge Cases
```typescript
describe('isValidEmail', () => {
  it('should handle empty string', () => { ... });
  it('should handle special characters', () => { ... });
  it('should handle very long emails', () => { ... });
});
```

### 4. Keep Tests Independent
```typescript
// ❌ Bad: Tests depend on each other
it('test 1', () => { globalState.value = 5; });
it('test 2', () => { expect(globalState.value).toBe(5); });

// ✅ Good: Each test is independent
it('test 1', () => {
  const state = { value: 5 };
  expect(state.value).toBe(5);
});
```

### 5. Use Test Data Factories
```typescript
const createMockUser = (overrides = {}) => ({
  id: 'user-1',
  name: 'John Doe',
  email: 'john@example.com',
  ...overrides,
});

it('should render user name', () => {
  const user = createMockUser({ name: 'Jane Doe' });
  render(<UserProfile user={user} />);
  expect(screen.getByText('Jane Doe')).toBeInTheDocument();
});
```

## 🐛 Debugging Tests

### Debug Specific Test
```bash
npx vitest src/test/security.test.ts --reporter=verbose
```

### Debug with Console Logs
```typescript
it('should debug', () => {
  console.log('Debug info:', data);
  expect(result).toBe(true);
});
```

### Debug Component Rendering
```typescript
import { screen } from '@testing-library/react';

it('should debug', () => {
  render(<Component />);
  screen.debug(); // Prints DOM to console
});
```

## 📚 Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Testing Playground](https://testing-playground.com/)

## 🎯 Next Steps

1. ✅ Setup Vitest infrastructure
2. ✅ Write security utility tests
3. ✅ Write validator tests
4. 🔄 Write custom hook tests
5. 🔄 Write component tests
6. 🔄 Write integration tests
7. 🔄 Setup Playwright for E2E tests
8. 🔄 Setup CI/CD for automated testing
9. 🔄 Achieve 80%+ coverage target

---

**Last Updated:** 2024
**Test Framework:** Vitest + React Testing Library
**Coverage Target:** 80%+
