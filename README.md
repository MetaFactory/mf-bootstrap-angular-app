# mf-bootstrap-angular-app

CLI tool to scaffold an Angular project from versioned templates.

## Installation

Install globally from the project root:

```bash
npm install -g .
```

Or run directly without installing:

```bash
node bin/cli.js <target-path>
```

## Usage

```
mf-bootstrap-angular-app <target-path> [--version <version>]
```

### Arguments

| Argument      | Description                                  |
| ------------- | -------------------------------------------- |
| `target-path` | Destination directory for the new project    |

### Options

| Option               | Description                                       |
| -------------------- | ------------------------------------------------- |
| `--version, -v <ver>`| Template version to use (defaults to latest)       |
| `--list`             | List all available template versions               |
| `--help, -h`         | Show help message                                  |

## Examples

Scaffold a project using the latest template version:

```bash
mf-bootstrap-angular-app ./my-project
```

Scaffold using a specific version:

```bash
mf-bootstrap-angular-app ./my-project --version 2.0.0
```

List available template versions:

```bash
mf-bootstrap-angular-app --list
```

## Adding a New Template Version

Place the full project scaffold under `templates/<version>/`:

```
templates/
  2.0.0/
    package.json
    src/
    ...
  3.0.0/
    package.json
    src/
    ...
```

The CLI automatically discovers all version directories and sorts them by semver to determine the latest.

## Project Structure

```
mf-bootstrap-angular-app/
├── bin/
│   └── cli.js          # CLI entry point
├── templates/
│   └── 2.0.0/          # Template files for v2.0.0
├── package.json
└── README.md
```
