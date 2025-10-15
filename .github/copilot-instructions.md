# CKEditor 5 Development Guide for AI Agents

## Architecture Overview

CKEditor 5 is a **monorepo framework** (v28.0.0) with a modular plugin-based architecture. The codebase consists of:

- **Core Libraries**: `ckeditor5-engine` (editing engine), `ckeditor5-core` (editor architecture), `ckeditor5-ui` (UI framework), `ckeditor5-utils` (utilities)
- **Editor Types**: Classic, Inline, Balloon, Decoupled Document builds in `packages/ckeditor5-build-*`
- **Feature Plugins**: Each feature is a separate package (e.g., `ckeditor5-basic-styles`, `ckeditor5-table`)
- **Custom Extensions**: Project includes custom plugins in `packages/ckeditor5-build-classic/plugins/` (mention-customization, attach-file, auto-video-embed)
- **Development Tools**: Custom webpack configs, DLL system, testing framework, and build scripts in `/scripts`

## Plugin Development Pattern

Every feature follows the **Plugin + Editing + UI** pattern:

```javascript
// Main plugin (e.g., packages/ckeditor5-basic-styles/src/bold.js)
export default class Bold extends Plugin {
    static get requires() {
        return [ BoldEditing, BoldUI ];  // Split functionality
    }
    static get pluginName() { return 'Bold'; }
}
```

- **Editing plugins**: Handle model/view conversion, commands, schema
- **UI plugins**: Add buttons, dropdowns, form elements  
- **Main plugin**: Combines editing + UI, declares dependencies

## Key Development Commands

```bash
# Bootstrap dependencies (uses Yarn workspaces)
yarn bootstrap

# Run tests for specific package
yarn test --files=packages/ckeditor5-core/**/*.js

# Run manual tests (browser-based visual testing)
yarn manual

# Verify manual test completeness
yarn manual:verify

# Build documentation and serve locally
yarn docs && yarn docs:serve

# Build DLL bundles (shared dependencies) - required for performance
yarn dll:build
yarn dll:build --dev  # Development mode

# Lint code and styles
yarn lint && yarn stylelint

# Clean and reinstall dependencies
yarn clean && yarn reinstall

# Build content styles for documentation
yarn docs:content-styles

# Translation management
yarn translations:collect
yarn translations:download
```

## Monorepo Package Structure

Each `packages/ckeditor5-*` follows this pattern:
- `src/index.js` - Main exports
- `src/[feature].js` - Main plugin class
- `src/[feature]/[feature]editing.js` - Model/view logic
- `src/[feature]/[feature]ui.js` - UI components
- `tests/` - Unit and integration tests
- `theme/` - CSS and SVG assets

## Editor Builds vs Framework

- **Builds** (`packages/ckeditor5-build-*`): Pre-configured editors with specific plugin sets
- **Framework**: Core packages for creating custom editors
- Build configs in `src/ckeditor.js` define plugin combinations and default configs

## Testing Conventions

- Tests use `@ckeditor/ckeditor5-dev-tests` custom framework (not Jest/Mocha)
- Manual tests in `tests/manual/` for visual/integration testing - include `.html`, `.js`, and `.md` files
- Performance fixtures in `tests/_data/` (small.html, medium.html, large.html)  
- Test utilities in `tests/_utils/` provide common editor configurations
- Unit tests follow describe/it pattern: `describe( 'PluginName', () => { it( 'should...', () => {} ) } )`
- Use `expect()` assertions from custom test framework

## Build System Specifics

- **Webpack-based** with custom `@ckeditor/ckeditor5-dev-webpack-plugin`
- **DLL bundles**: Core packages are pre-built as shared libraries for performance
- **CSS processing**: Custom PostCSS setup for theme variables and SVG inlining
- **Babel transforms**: ES6+ with custom transforms for CKEditor modules

## Import Patterns

```javascript
// Internal package imports (same monorepo)
import { Plugin } from 'ckeditor5/src/core';
import BoldEditing from './bold/boldediting';

// Cross-package imports
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

// Build configuration pattern (packages/ckeditor5-build-classic/src/ckeditor.js)
import MentionCustomization from '../plugins/mention-customization';
import AttachFile from '../plugins/attach-file';
import AutoVideoEmbed from '../plugins/auto-video-embed';
```

## Development Workflow Notes

- Use `yarn` not `npm` (workspace configuration requires Yarn)
- Changes in core packages (`engine`, `core`, `ui`) affect all features
- Manual tests essential for UI/UX validation - run `yarn manual` frequently  
- DLL rebuilds required when changing core package exports
- Schema changes in engine require careful model/view conversion updates
- Node.js >=12.0.0 required, uses `--max_old_space_size=8192` for memory-intensive operations

## Custom Build Creation

When creating custom builds:
1. Create new package in `/packages/ckeditor5-build-[name]`
2. Configure plugins in `src/ckeditor.js` 
3. Update `webpack.config.js` for bundling
4. Add build scripts to main `package.json`
5. Test with both unit and manual tests

## Common Debugging

- Use CKEditor 5 Inspector browser extension for model/view debugging
- Check schema conflicts when plugins don't work together
- Verify command registration and execution flow
- Console warnings often indicate schema or conversion issues