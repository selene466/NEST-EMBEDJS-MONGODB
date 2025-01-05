import { Injectable, OnModuleInit } from '@nestjs/common';
import { RAGApplication, RAGApplicationBuilder } from '@llm-tools/embedjs';
import { OllamaEmbeddings, Ollama } from '@llm-tools/embedjs-ollama';
// import { HNSWDb } from '@llm-tools/embedjs-hnswlib';
// import { MongoDb } from '@llm-tools/embedjs-mongodb';
import { LibSqlDb } from '@llm-tools/embedjs-libsql';
import { DocxLoader } from '@llm-tools/embedjs-loader-msoffice';

@Injectable()
export class LlmService implements OnModuleInit {
  private ragApplication: RAGApplication;
  async onModuleInit() {
    console.log(process.env.DATABASE_URL);
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
      .setVectorDatabase(new LibSqlDb({ path: './data.db' }))

      .build();
  }

  async query(query: string) {
    this.ragApplication.query(query);
  }

  async addDocx() {
    this.ragApplication.addLoader(
      new DocxLoader({ filePathOrUrl: 'file.docx' }),
    );
  }
}
