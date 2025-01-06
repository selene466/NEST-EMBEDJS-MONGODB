import {
  Controller,
  Get,
  Post,
  Body,
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

  @Post('prompt/')
  promptAI(@Body() promptAI: { context: string; prompt: string }) {
    return this.llmService.prompt(promptAI);
  }

  @Get('delete-conversation/')
  deleteConversation() {
    return this.llmService.deleteConversation();
  }

  @Get('list-file/')
  listFile() {
    return this.llmService.listFiles();
  }

  @Post('remove-file-loader/')
  removeFileLoader() {
    return this.llmService.removeFileLoader();
  }

  @Post('add-file-loader/')
  addFileLoader(@Body() fileLoader: { path: string }) {
    return this.llmService.addFileLoader(fileLoader.path);
  }
}
