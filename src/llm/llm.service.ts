import { Injectable, OnModuleInit } from '@nestjs/common';
import { RAGApplication, RAGApplicationBuilder } from '@llm-tools/embedjs';
import { OllamaEmbeddings, Ollama } from '@llm-tools/embedjs-ollama';
import { QueryResponse } from '@llm-tools/embedjs-interfaces';
// import { HNSWDb } from '@llm-tools/embedjs-hnswlib';
// import { MongoDb } from '@llm-tools/embedjs-mongodb';
import { LibSqlDb } from '@llm-tools/embedjs-libsql';
import { DocxLoader } from '@llm-tools/embedjs-loader-msoffice';
import { DatabaseService } from '../database/database.service.js';
import * as fs from 'fs';
import { promises as fsPromises } from 'fs';
import { fileURLToPath } from 'url';
import * as path from 'path';
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

  async addDocx(filePath: string) {
    console.log('ADDED TO DOCX:', filePath);
    this.ragApplication.addLoader(new DocxLoader({ filePathOrUrl: filePath }));
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

      // Save file locally
      const writeStream = fs.createWriteStream(uploadPath);
      writeStream.write(file.buffer);
      writeStream.end();

      // Save metadata to MongoDB using Prisma
      const savedFile = await this.databaseService.fileUpload.create({
        data: {
          name: file.originalname,
          mime: file.mimetype,
          size: file.size,
          path: uploadPath,
        },
      });

      if (savedFile.mime.includes('word')) {
        this.addDocx(savedFile.path);
      }

      return savedFile;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
