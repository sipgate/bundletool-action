const core = require("@actions/core");
const exec = require("@actions/exec");
const tc = require("@actions/tool-cache");
const io = require("@actions/io");
const path = require("path");

const BUNDLETOOL_URL = "https://github.com/google/bundletool/releases/download/1.16.0/bundletool-all-1.16.0.jar";

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

        await io.cp(downloadPath, bundleToolFile);

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