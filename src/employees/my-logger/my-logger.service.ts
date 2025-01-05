import { Injectable, ConsoleLogger } from '@nestjs/common';
import * as fs from 'fs';
import { promises as fsPromises } from 'fs';
import { fileURLToPath } from 'url';
import * as path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

@Injectable()
export class MyLoggerService extends ConsoleLogger {
  async logToFile(entry: any) {
    const formattedEntry = `${Intl.DateTimeFormat('en-US', {
      dateStyle: 'short',
      timeStyle: 'short',
      timeZone: 'UTC',
    }).format(new Date())}\t${entry}\n`;

    try {
      if (!fs.existsSync(path.join(__dirname, '..', '..', 'logs'))) {
        await fsPromises.mkdir(path.join(__dirname, '..', '..', 'logs'));
        await fsPromises.appendFile(
          path.join(__dirname, '..', '..', 'logs', 'log.txt'),
          formattedEntry,
        );
      }
    } catch (err) {
      if (err instanceof Error) console.error(err.message);
    }
  }

  log(message: any, context?: string) {
    const entry = `${context}\t${message}`;

    this.logToFile(entry);

    super.log(message, context);
  }

  error(message: any, stackOrContext?: string) {
    const entry = `${stackOrContext}\t${message}`;

    this.logToFile(entry);

    super.error(message, stackOrContext);
  }
}
