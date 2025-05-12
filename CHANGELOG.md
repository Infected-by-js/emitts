# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.5] - 2025-05-12

### Changed
- Updated changelog to include all recent changes

## [1.0.4] - 2025-05-12

### Changed
- Improved JSDoc comments across the codebase for better clarity
- Enhanced type documentation with examples
- Changed class description to be more user-friendly
- Removed implementation details from public documentation

## [1.0.3] - 2025-05-12

### Changed
- Removed `IEmitTS` interface from public exports to simplify imports
- Users now only need to import concrete classes and types

## [1.0.2] - 2025-05-12

### Fixed
- Fixed package size by excluding test files from the distribution
- Optimized build process to clean previous builds

## [1.0.1] - 2025-05-12

### Changed
- Package renamed to `@infectedbyjs/emitts` due to naming conflict on npm

## [1.0.0] - 2025-05-11

### Added
- Initial release
- Type-safe event emitter implementation
- Priority-based listener execution
- Sequential and parallel execution strategies
- Memory leak detection
- Debug mode support
- Promise-based API
- Full TypeScript support
- Zero dependencies
- Comprehensive test coverage
- Detailed documentation 
