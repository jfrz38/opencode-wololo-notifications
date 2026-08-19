.PHONY: help
help: ## show make targets
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {sub("\\\\n",sprintf("\n%22c"," "), $$2);printf " \033[36m%-20s\033[0m  %s\n", $$1, $$2}' $(MAKEFILE_LIST)

.PHONY: install install-frozen
install: ## install project dependencies
	pnpm install

install-frozen: ## install dependencies from lockfile
	pnpm install --frozen-lockfile

.PHONY: clean build
clean: ## clean build artifacts
	rm -rf dist

build: ## compile the project
	pnpm run build

.PHONY: lint test check ci
lint: ## run TypeScript type checking
	pnpm run lint

test: ## run unit tests
	pnpm test

check: ## run lint, tests, and build
	pnpm run prepublishOnly

ci: install-frozen check ## install from lockfile and run all checks

.PHONY: pack-dry-run publish-npm
pack-dry-run: ## preview npm package contents without publishing
	pnpm pack --dry-run

publish-npm: ## publish package to npm
	pnpm publish
