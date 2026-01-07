# Contributing to Range App

Thank you for your interest in contributing to Range App! This guide will help you get started.

## How to Contribute

### Reporting Bugs

1. Check [existing issues](https://github.com/jordanstella/range-training/issues) to avoid duplicates
2. Use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md)
3. Include browser/OS information, steps to reproduce, and screenshots if applicable

### Suggesting Features

1. Check existing issues and discussions first
2. Use the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md)
3. Explain the problem you're trying to solve

### Pull Requests

1. Fork the repository
2. Create a feature branch from `main`: `git checkout -b feat/your-feature`
3. Make your changes following our [code conventions](#code-conventions)
4. Test on both desktop and mobile browsers
5. Commit using [Conventional Commits](#commit-messages)
6. Push and open a pull request

## Development Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (Latest LTS)
- npm

### Getting Started

```bash
git clone https://github.com/jordanstella/range-training.git
cd range-training
npm install
npm run dev
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Type-check and build for production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |

## Code Conventions

### Components

- Use shadcn/ui components from `src/components/ui/`
- Use `cn()` helper from `src/lib/utils.ts` for conditional classes

### Forms

- Use React Hook Form for form state
- Use Zod schemas from `src/lib/validations.ts` for validation

### State Management

- Use Zustand stores in `src/stores/`
- Define state-modifying actions within stores
- Components should select only needed state slices

### Database

- All queries go through Drizzle ORM
- Schema is defined in `src/db/schema.ts`
- Use `generateId()` from `src/lib/utils.ts` for new records

### Styling

- Use Tailwind CSS utility classes
- Follow existing patterns in the codebase

## Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <description>

[optional body]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, semicolons, etc.)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat: add drill attempt history export
fix: correct MOA calculation for metric distances
docs: update README installation steps
```

## Questions?

Open a [discussion](https://github.com/jordanstella/range-training/discussions) or issue if you need help!
