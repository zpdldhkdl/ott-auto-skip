PROJECT_NAME := ott-auto-skip
VERSION := $(shell node -p "JSON.parse(require('node:fs').readFileSync('package.json','utf8')).version")
RELEASE_DIR := release
UNPACKED_DIR := $(RELEASE_DIR)/unpacked
ZIP_NAME := $(PROJECT_NAME)-v$(VERSION).zip
ZIP_PATH := $(RELEASE_DIR)/$(ZIP_NAME)

.PHONY: icons build package zip release clean

icons:
	npm run icons

build: icons
	npm run build

package: icons
	npm run package

zip: package
	rm -f "$(ZIP_PATH)"
	cd "$(UNPACKED_DIR)" && zip -r "../$(ZIP_NAME)" .

release: zip
	@echo "Created: $(ZIP_PATH)"

clean:
	rm -rf dist release
