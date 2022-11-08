/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 6:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 525:
/***/ ((module) => {

module.exports = eval("require")("@actions/exec");


/***/ }),

/***/ 308:
/***/ ((module) => {

module.exports = eval("require")("@actions/io");


/***/ }),

/***/ 572:
/***/ ((module) => {

module.exports = eval("require")("@actions/tool-cache");


/***/ }),

/***/ 17:
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
const core = __nccwpck_require__(6);
const exec = __nccwpck_require__(525);
const tc = __nccwpck_require__(572);
const io = __nccwpck_require__(308);
const path = __nccwpck_require__(17);

const BUNDLETOOL_URL = "https://github.com/google/bundletool/releases/download/1.13.0/bundletool-all-1.13.0.jar";

async function run() {
    try {
        if (process.platform !== "darwin" && process.platform !== "linux") {
            throw new Error(
                "Unsupported virtual machine: please use either macos or ubuntu VM."
            );
        }
        // parameters passed to the plugin
        const AAB_FILE = core.getInput("aabFile");
        const KEYSTORE_FILE = core.getInput("keystoreFile");
        const KEYSTORE_PASSWORD = core.getInput("keystorePassword");
        const KEYSTORE_ALIAS = core.getInput("keystoreAlias");
        const KEY_PASSWORD = core.getInput("keyPassword");

        const bundleToolPath = `${process.env.HOME}/bundletool`;
        const bundleToolFile = `${bundleToolPath}/bundletool.jar`;

        await io.mkdirP(bundleToolPath);

        core.info(`${bundleToolPath} directory created`);

        const downloadPath = await tc.downloadTool(BUNDLETOOL_URL);

        await io.mv(downloadPath, bundleToolFile);

        core.info(`${bundleToolFile} moved to directory`);

        core.addPath(bundleToolPath);

        core.info(`${bundleToolPath} added to path`);

        await exec.exec(`chmod +x ${bundleToolFile}`);

        await io.which("bundletool.jar", true);

        var extension = path.extname(AAB_FILE);
        var filename = path.basename(AAB_FILE, extension);

        await exec.exec(`java -jar ${bundleToolFile} build-apks --bundle=${AAB_FILE} --output=${filename}.apks --ks=${KEYSTORE_FILE} --ks-pass=pass:${KEYSTORE_PASSWORD} --ks-key-alias=${KEYSTORE_ALIAS} --key-pass=pass:${KEY_PASSWORD} --mode=universal`);
        await exec.exec(`mv ${filename}.apks ${filename}.zip`);
        await exec.exec(`unzip ${filename}.zip`);
        await exec.exec(`mv universal.apk ${filename}.apk`);
        core.setOutput("apkPath", `${filename}.apk`);
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
})();

module.exports = __webpack_exports__;
/******/ })()
;