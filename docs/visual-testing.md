# Visual Testing Guide

This comprehensive guide explains how to use Playwright's visual screenshot testing to automatically catch visual bugs in the Cipher Kids application across all themes and devices.

## Overview

The Cipher Kids app has comprehensive visual regression testing that accounts for:
- **5 Different Themes**: light, dark, system, matrix, emoji
- **7 Cipher Pages**: All cipher implementations
- **Multiple Viewports**: Mobile, tablet, desktop
- **Component States**: Different modes, error states, loading states
- **103 Baseline Screenshots**: Complete visual coverage

## Quick Start

### Running Visual Tests

```bash
# Run critical visual tests (fast, essential coverage)
npm run test:visual:critical

# Run all visual regression tests
npm run test:visual

# Run visual tests for desktop viewport
npm run test:visual:desktop

# Run all visual tests (mobile + desktop)
npm run test:visual:all
```

### Updating Baselines

```bash
# Generate/update baseline screenshots
npm run test:visual:update

# Update critical test baselines only
npm run test:visual:critical:update
```

### Cleanup

```bash
# Clean up test artifacts and old screenshots
npm run test:visual:clean
```

## Test Architecture

### 1. Multi-Tiered Testing Strategy

#### Critical Visual Tests (`visual-critical.spec.ts`)
**Purpose**: Fast, essential visual tests that must always pass
**Runtime**: ~6-7 seconds
**Coverage**: 
- Core pages (home, config) in light/dark themes only
- Most important ciphers (Caesar, Morse, Keyword)
- Essential UI components (mode toggle, inputs)
- Basic responsive design (mobile/tablet)

**When to run**: Every commit, PR checks, development workflow

#### Comprehensive Visual Tests (`visual-regression.spec.ts`)
**Purpose**: Complete visual coverage across all themes and states
**Runtime**: ~10-15 minutes
**Coverage**:
- All cipher pages × all themes (35+ screenshots)
- All UI components × all themes
- Error states, loading states
- Theme-specific features (matrix/emoji backgrounds)
- Full responsive testing

**When to run**: Before releases, when making visual changes

#### Component Visual Tests (`visual-components.spec.ts`)
**Purpose**: Isolated testing of individual UI components
**Runtime**: ~5-8 minutes
**Coverage**:
- Buttons, inputs, cards, navigation
- Theme variations for each component
- Different component states

**When to run**: When modifying UI components

### 2. Theme-Aware Testing

Each visual test handles themes by:
1. Setting theme via localStorage before page load
2. Applying theme classes to document body
3. Waiting for theme to fully apply
4. Disabling animations for consistent screenshots

#### Theme Coverage Strategy
- **Critical Tests**: Light + Dark themes only (faster execution)
- **Comprehensive Tests**: All 5 themes (complete coverage)
- **Component Tests**: Selective theme coverage based on importance

#### Theme-Specific Features
- **Matrix Theme**: Special handling for animated background
- **Emoji Theme**: Special handling for emoji animations
- **System Theme**: Tested as both light and dark variants

## File Organization

```
tests/
├── visual-critical.spec.ts              # Essential visual tests (18 tests)
├── visual-regression.spec.ts            # Comprehensive visual tests (80+ tests)
├── visual-components.spec.ts            # Component-focused tests (30+ tests)
├── visual-cipher-pages.spec.ts          # Legacy cipher page tests
├── visual-critical.spec.ts-snapshots/   # Critical test baselines
├── visual-regression.spec.ts-snapshots/ # Comprehensive test baselines
├── visual-components.spec.ts-snapshots/ # Component test baselines
└── visual-cipher-pages.spec.ts-snapshots/ # Legacy baselines
```

## Screenshot Naming Convention

Screenshots are automatically named by Playwright using this pattern:
```
{test-name}-{project-name}-{platform}.png
```

Examples:
- `critical-home-light-Visual-Tests---Mobile-linux.png`
- `cipher-caesar-dark-Visual-Tests---Mobile-linux.png`
- `button-primary-light-Visual-Tests---Mobile-linux.png`

## Configuration

### Playwright Configuration (`playwright.config.ts`)

```typescript
expect: {
  toHaveScreenshot: { 
    threshold: 0.2,           // 20% difference tolerance
    mode: 'strict',           // Strict comparison mode
    animations: 'disabled',   // Disable animations
  },
}
```

### Visual Test Projects

- **Visual Tests - Mobile**: Pixel 5 viewport (375×667)
- **Visual Tests - Desktop**: Desktop Chrome (1280×720)

Both projects use:
- Light color scheme (consistent baseline)
- Reduced motion preference
- UTC timezone
- en-US locale

## Best Practices

### 1. Writing Visual Tests

```typescript
// ✅ Good: Disable animations and wait for stability
async function preparePage(page: Page): Promise<void> {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        transition-duration: 0s !important;
      }
    `
  });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
}

// ✅ Good: Set theme before navigation
await setTheme(page, 'dark');
await page.goto('/ciphers/caesar');
await preparePage(page);

// ✅ Good: Use descriptive screenshot names
await expect(page).toHaveScreenshot('caesar-dark-theme.png');
```

### 2. Handling Theme Changes

```typescript
// ✅ Good: Set theme via localStorage (faster)
async function setTheme(page: Page, theme: string): Promise<void> {
  await page.addInitScript((themeToSet) => {
    localStorage.setItem('vite-ui-theme', themeToSet);
  }, theme);
  
  await page.evaluate((themeToSet) => {
    document.body.classList.remove('light', 'dark', 'matrix', 'emoji');
    document.body.classList.add(themeToSet);
  }, theme);
  
  await page.waitForTimeout(300);
}
```

### 3. Managing Test Performance

```typescript
// ✅ Good: Use focused selectors for component tests
const button = page.locator('[data-testid="encrypt-button"]');
await expect(button).toHaveScreenshot('encrypt-button.png');

// ✅ Good: Group related tests
test.describe('Caesar Cipher - All Themes', () => {
  THEMES.forEach(theme => {
    test(`Caesar cipher - ${theme} theme`, async ({ page }) => {
      // Test implementation
    });
  });
});
```

## CI/CD Integration

### GitHub Actions Workflow

Visual tests run in a separate job in parallel with functional tests:

```yaml
visual-tests:
  runs-on: ubuntu-latest
  steps:
    - name: Run Visual Regression Tests
      run: npm run test:visual
    
    - name: Upload Visual Test Results
      if: failure()
      uses: actions/upload-artifact@v4
      with:
        name: visual-test-results
        path: |
          ./app/test-results/
          ./app/tests/visual-*.spec.ts-snapshots/
```

### Artifact Handling

When visual tests fail:
1. **Diff Images**: Uploaded as artifacts showing differences
2. **Test Results**: Complete test output and logs
3. **HTML Report**: Interactive Playwright report

## Troubleshooting

### Common Issues

#### 1. Flaky Visual Tests
**Symptoms**: Tests pass/fail inconsistently
**Solutions**:
- Increase wait times after theme changes
- Disable more animations
- Check for dynamic content (timestamps, random data)

#### 2. Font Rendering Differences
**Symptoms**: Text appears slightly different between runs
**Solutions**:
- Ensure web fonts are loaded (`await page.waitForFunction(() => document.fonts.ready)`)
- Increase threshold tolerance
- Use consistent font loading strategy

#### 3. Theme Not Applied
**Symptoms**: Screenshots show wrong theme
**Solutions**:
- Verify theme is set before navigation
- Check localStorage is properly set
- Ensure theme classes are applied to body

#### 4. Large Screenshot Diffs
**Symptoms**: Many tests fail after UI changes
**Solutions**:
- Review changes systematically
- Update baselines in batches
- Use `--update-snapshots` flag carefully

### Debugging Failed Tests

1. **Download Artifacts**: Get diff images from CI
2. **Run Locally**: Reproduce with same configuration
3. **Check Timing**: Verify elements are fully loaded
4. **Inspect Theme**: Ensure correct theme is applied

```bash
# Debug specific test locally
npx playwright test tests/visual-critical.spec.ts --project="Visual Tests - Mobile" --grep="Home page - light theme" --debug
```

## Test Coverage

### Current Coverage (103 Baseline Screenshots)

#### Critical Tests (18 tests)
- Home page: light/dark themes
- Caesar cipher: light/dark themes
- Morse cipher: light/dark themes
- Keyword cipher: light/dark themes
- UI components: mode toggle, inputs (light/dark)
- Responsive: mobile/tablet viewports
- Theme backgrounds: matrix, emoji
- Error states: API notifications

#### Comprehensive Tests (80+ tests)
- All cipher pages × all themes (35 screenshots)
- Home/config pages × all themes (10 screenshots)
- Full responsive testing (24 screenshots)
- Component variations (30+ screenshots)

#### Component Tests (30+ tests)
- Button states and variations
- Card components (result, educational, status)
- Input components (text, slider, keyword validation)
- Navigation components
- Visualization components (alphabet mapping, morse, pigpen)
- Theme-specific component variations

## Maintenance

### Regular Tasks

1. **Review Baselines**: Check new screenshots before committing
2. **Update Documentation**: Keep this guide current
3. **Monitor Performance**: Track test execution time
4. **Clean Artifacts**: Remove old test results

### When to Update Baselines

- ✅ **Intentional Design Changes**: New features, UI improvements
- ✅ **Theme Updates**: Changes to color schemes or layouts
- ✅ **Component Updates**: Modified UI components
- ❌ **Accidental Changes**: Bugs, regressions, unintended modifications

### Baseline Review Process

1. **Run Tests**: Execute visual tests locally
2. **Review Diffs**: Examine all changed screenshots
3. **Verify Intent**: Ensure changes are intentional
4. **Update Selectively**: Only update intended changes
5. **Document Changes**: Note what changed and why

## Performance Considerations

### Test Execution Time

- **Critical Tests**: ~6-7 seconds (essential coverage)
- **Comprehensive Tests**: ~10-15 minutes (full coverage)
- **Component Tests**: ~5-8 minutes (component focus)

### Optimization Strategies

1. **Parallel Execution**: Tests run in parallel where possible
2. **Selective Testing**: Use critical tests for fast feedback
3. **Efficient Selectors**: Target specific elements vs full page
4. **Theme Batching**: Group tests by theme to reduce switching

## Development Workflow Integration

### For Developers

1. **Before Committing**: Run critical visual tests
   ```bash
   npm run test:visual:critical
   ```

2. **Before Major Changes**: Run comprehensive tests
   ```bash
   npm run test:visual
   ```

3. **When UI Changes**: Update baselines if intentional
   ```bash
   npm run test:visual:update
   ```

### For Code Reviews

1. **Check Visual Changes**: Review any baseline updates
2. **Verify Intent**: Ensure visual changes are intentional
3. **Test Coverage**: Ensure new components have visual tests

## Future Enhancements

1. **Cross-Browser Testing**: Add Firefox, Safari support
2. **Accessibility Testing**: Visual tests for high contrast modes
3. **Performance Integration**: Combine with performance metrics
4. **Smart Baselines**: Automated baseline management
5. **Visual Analytics**: Trend analysis and reporting

## Summary

This comprehensive visual testing setup ensures the Cipher Kids application maintains visual consistency across all themes and devices while providing fast feedback on visual regressions. The multi-tiered approach balances thorough coverage with development speed, making visual testing an integral part of the development workflow.

### Key Benefits

- **Automatic Regression Detection**: Catches visual bugs before they reach users
- **Theme Consistency**: Ensures all themes work correctly
- **Fast Feedback**: Critical tests provide quick validation
- **Comprehensive Coverage**: 103 baseline screenshots cover all major UI elements
- **CI/CD Integration**: Automated testing in the deployment pipeline

The system is production-ready and actively protecting the visual quality of the Cipher Kids application.