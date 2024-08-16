# Denotag

Tag editor.

## Setup

```sh
git submodule update --init
git config --local core.hooksPath ./.git-hooks/hooks
```

## Compiling

```sh
# Create env and set env to production
cp .env.example .env
deno task compile
```
