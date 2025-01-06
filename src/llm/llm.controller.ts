import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LlmService } from './llm.service.js';
import { Prisma } from '@prisma/client';
import { Throttle } from '@nestjs/throttler';

@Controller('llm')
export class LlmController {
  constructor(private readonly llmService: LlmService) {}

  @Throttle({
    short: { ttl: 100, limit: 10000 },
    long: { ttl: 1000, limit: 10000 },
  })
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.llmService.fileUpload(file);
  }

  @Patch('file/:id')
  updateFile(
    @Param('id') id: string,
    @Body() updateFileInp: Prisma.FileUploadUpdateInput,
  ) {
    return this.llmService.updateFile(id, updateFileInp);
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

  @Get('list-group/')
  listGroup() {
    return this.llmService.listGroup();
  }

  @Post('create-group/')
  createGroup(@Body() createGroupInp: Prisma.FileGroupCreateInput) {
    return this.llmService.createGroup(createGroupInp);
  }

  @Patch('update-group/:id')
  updateGroup(
    @Param('id') id: string,
    @Body() updateGroupInp: Prisma.FileGroupUpdateInput,
  ) {
    return this.llmService.updateGroup(id, updateGroupInp);
  }

  @Delete('delete-group/:id')
  deleteGroup(@Param('id') id: string) {
    return this.llmService.deleteGroup(id);
  }
}
