import { Config } from '@remotion/cli/config';
import fs from 'fs';

// In the cloud box, use the Chromium that is already installed; elsewhere Remotion downloads its own.
const local = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
if (fs.existsSync(local)) Config.setBrowserExecutable(local);
Config.setEntryPoint('src/index.ts');
Config.setVideoImageFormat('jpeg');
