import { Module } from '@nestjs/common';
import { LlmService } from './llm.service.js';
import { LlmController } from './llm.controller.js';
import { DatabaseModule } from '../database/database.module.js';

@Module({
  imports: [DatabaseModule],
  providers: [LlmService],
  controllers: [LlmController],
})
export class LlmModule {}
