import { Injectable, OnModuleInit } from '@nestjs/common';
import { RAGApplication, RAGApplicationBuilder } from '@llm-tools/embedjs';
import { OllamaEmbeddings, Ollama } from '@llm-tools/embedjs-ollama';
import { QueryResponse } from '@llm-tools/embedjs-interfaces';
// import { HNSWDb } from '@llm-tools/embedjs-hnswlib';
// import { MongoDb } from '@llm-tools/embedjs-mongodb';
import { LibSqlDb } from '@llm-tools/embedjs-libsql';
import {
  DocxLoader,
  ExcelLoader,
  PptLoader,
} from '@llm-tools/embedjs-loader-msoffice';
import { PdfLoader } from '@llm-tools/embedjs-loader-pdf';
import { DatabaseService } from '../database/database.service.js';
import * as fs from 'fs';
import { promises as fsPromises } from 'fs';
import { fileURLToPath } from 'url';
import * as path from 'path';
import checksum from 'checksum';
// import { PrismaClient } from '@prisma/client';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// const sqliteVectorClient = new PrismaClient({
//   datasources: { db: { url: 'file:./data.db' } },
// });

@Injectable()
export class LlmService implements OnModuleInit {
  constructor(private readonly databaseService: DatabaseService) {}
  private ragApplication: RAGApplication;

  async onModuleInit() {
    const sqliteVectorPath = path.join(__dirname, '..', 'data.db');
    this.ragApplication = await new RAGApplicationBuilder()
      .setModel(
        new Ollama({
          modelName: 'llama3.2-vision:11b-instruct-q4_K_M',
          baseUrl: 'http://localhost:11434',
        }),
      )

      .setEmbeddingModel(
        new OllamaEmbeddings({
          model: 'nomic-embed-text:latest',
          baseUrl: 'http://localhost:11434',
        }),
      )
      .setTemperature(0.008)

      // .setVectorDatabase(new HNSWDb())

      // .setVectorDatabase(
      //   new MongoDb({
      //     connectionString: process.env.DATABASE_URL,
      //   }),
      // )
      .setVectorDatabase(new LibSqlDb({ path: sqliteVectorPath }))

      .build();
  }

  async query(query: string): Promise<QueryResponse> {
    return this.ragApplication.query(query);
  }

  async prompt(promptAI: {
    context: string;
    prompt: string;
  }): Promise<QueryResponse> {
    return this.ragApplication.query(
      `system: "jawab langsung tanpa basa basi"\session: ${promptAI.context}\nprompt:${promptAI.prompt}`,
    );
  }

  async deleteConversation() {
    await this.ragApplication.deleteConversation('default');
  }

  async removeFileLoader() {
    await this.ragApplication.deleteLoader('default');
    return 'done';
  }

  async addFileLoader(filePath: string) {
    if (filePath.endsWith('.docx') || filePath.endsWith('.doc')) {
      console.log('ADDED TO DOCX:', filePath);
      await this.ragApplication.addLoader(
        new DocxLoader({ filePathOrUrl: filePath }),
      );
    }

    if (filePath.endsWith('.xlsx') || filePath.endsWith('.xls')) {
      console.log('ADDED TO XLSX:', filePath);
      await this.ragApplication.addLoader(
        new ExcelLoader({ filePathOrUrl: filePath }),
      );
    }

    if (filePath.endsWith('.pptx') || filePath.endsWith('.ppt')) {
      console.log('ADDED TO PPTX:', filePath);
      await this.ragApplication.addLoader(
        new PptLoader({ filePathOrUrl: filePath }),
      );
    }

    if (filePath.endsWith('.pdf')) {
      console.log('ADDED TO PDF:', filePath);
      await this.ragApplication.addLoader(
        new PdfLoader({ filePathOrUrl: filePath }),
      );
    }
    return 'done';
  }

  async fileUpload(file: Express.Multer.File) {
    console.log(file);
    try {
      if (!fs.existsSync(path.join(__dirname, '..', 'uploads'))) {
        await fsPromises.mkdir(path.join(__dirname, '..', 'uploads'));
      }

      const uploadPath = path.join(
        __dirname,
        '..',
        'uploads',
        file.originalname,
      );

      // Checksum
      const fileChecksum = checksum(uploadPath);

      // Check existing file
      const existingFile = await this.databaseService.fileUpload.findFirst({
        where: {
          checksum: fileChecksum,
        },
      });

      if (existingFile) {
        return existingFile;
      }

      // check same file name
      const existingFileName = await this.databaseService.fileUpload.findFirst({
        where: {
          name: file.originalname,
        },
      });

      if (existingFileName) {
        const fileName = file.originalname.split('.')[0] + `_${Date.now()}`;
        const fileFormat = file.originalname.split('.')[1];
        file.originalname = fileName + '.' + fileFormat;
      }

      // Save file locally
      const writeStream = fs.createWriteStream(uploadPath);
      writeStream.write(file.buffer);
      writeStream.end();

      // Save metadata to MongoDB using Prisma
      const savedFile = await this.databaseService.fileUpload.create({
        data: {
          name: file.originalname,
          checksum: fileChecksum,
          mime: file.mimetype,
          size: file.size,
          path: uploadPath,
        },
      });

      return savedFile;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async listFiles() {
    try {
      return this.databaseService.fileUpload.findMany();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
