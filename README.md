# Denotag

Tag editor.

## Setup

```sh
git submodule update --init
```

```sh
git config --local core.hooksPath ./.git-hooks/hooks
```

## Compiling

Create env and set env to production

```sh
cp .env.example .env
```

```sh
deno task compile
```
