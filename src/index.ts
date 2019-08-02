import * as fs from 'fs-extra';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { gitCommitPush } from 'git-commit-push-via-github-api';
import { Figma } from './Figma';
import { File } from 'figma-types';

dotenv.config();
if (dotenv.error) {
  throw dotenv.error;
}

class App {
  async run() {
    const figmaInfo: [File, string] = await new Figma().getFigmaFile();
    if (!figmaInfo) {
      throw new Error('figma file is empty');
    }

    const outputPath = figmaInfo[1];
    const branchName = figmaInfo[0].name.split('_')[0];

    const options = {
      owner: process.env.REPO_OWNER,
      repo: process.env.REPO_NAME,
      // commit files
      files: [
        {
          path: path.basename(outputPath),
          content: fs.readFileSync(outputPath, 'utf-8'),
        },
      ],
      fullyQualifiedRef: `heads/${branchName}`,
      forceUpdate: false, // optional default = false
      commitMessage: 'HELLO',
      token: process.env.GITHUB_API_TOKEN,
    };

    gitCommitPush(options);
  }
}

const app = new App();
app.run();
