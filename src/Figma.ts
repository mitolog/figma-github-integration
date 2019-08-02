import * as dotenv from 'dotenv';
import axios, { AxiosRequestConfig } from 'axios';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as uuidv4 from 'uuid/v4';
import { File } from 'figma-types';

dotenv.config();
if (dotenv.error) {
  throw dotenv.error;
}

export class Figma {
  /**
   * Get figma file where file id is specified on .env file.
   * returns {string} file path of output json file.
   */
  async getFigmaFile(): Promise<[File, string]> {
    var fileData: File;

    try {
      const filesResult = await axios(this.filesConfig());
      fileData = filesResult.data as File;
    } catch (error) {
      throw new Error(error);
    }

    if (!fileData) {
      throw new Error('no figma files found.');
    }

    const outputDir = path.resolve(process.cwd(), process.env.OUTPUT_PATH);
    fs.ensureDirSync(outputDir);

    let fileName = fileData.name ? fileData.name.split('_')[1] : uuidv4();
    const filePath = path.join(outputDir, `${fileName}.json`);
    await fs.writeFile(filePath, JSON.stringify(fileData));
    return [fileData, filePath];
  }

  private filesConfig(): AxiosRequestConfig {
    return {
      url: `/files/${process.env.FIGMA_FILE_KEY}`,
      method: 'get',
      baseURL: 'https://api.figma.com/v1/',
      headers: {
        'X-FIGMA-TOKEN': process.env.FIGMA_ACCESS_TOKEN,
      },
    };
  }
}
