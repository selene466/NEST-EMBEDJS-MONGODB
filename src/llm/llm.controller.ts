import {
  Controller,
  Get,
  Post,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LlmService } from './llm.service.js';

@Controller('llm')
export class LlmController {
  constructor(private readonly llmService: LlmService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.llmService.fileUpload(file);
  }

  @Get('prompt/')
  promptQuery(@Query('prompt') prompt: string) {
    return this.llmService.query(prompt);
  }
}
