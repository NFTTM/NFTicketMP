import {
  Body,
  Controller,
  Get,
  HttpException,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
  Response,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Express } from 'express';
import { Blob } from 'buffer';
import { EventService } from './event.service';
import { FileDataDto } from '../dtos/file-data.dto';
import { EventdataDto } from 'src/dtos/event-data.dto';

@ApiTags('event')
@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) { }

  @Get('')
  @ApiOperation({
    summary: 'All events',
    description: 'Gets all events stored on this server',
  })
  @ApiResponse({
    status: 200,
    description: 'All events',
  })
  @ApiResponse({
    status: 503,
    description: 'The server is not configured correctly',
    type: HttpException,
  })
  async getAllData() {
    try {
      const result = this.eventService.getAll();
      return result;
    } catch (error) {
      throw new HttpException(error.message, 503);
    }
  }

  @Post('eventdata')
  @ApiOperation({
    summary: 'Register event metadata',
    description: 'Registers detailed info for an event',
  })
  @ApiResponse({
    status: 201,
    description: 'Event registered',
  })
  @ApiResponse({
    status: 503,
    description: 'Server Error',
    type: HttpException,
  })
  setEventData(@Body() body: EventdataDto) {
    const updatedObj = this.eventService.setEventData(body);
    return updatedObj;
  }

  @Post('file/')
  @ApiOperation({
    summary: 'Register base image',
    description: 'Registers a base image for this event in the database',
  })
  @ApiResponse({
    status: 201,
    description: 'File registered',
  })
  @ApiResponse({
    status: 503,
    description: 'Server Error',
    type: HttpException,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    const fileData = new FileDataDto(
      file.originalname,
      file.mimetype,
      file.filename,
      file.size,
    );
    const savedObj = this.eventService.pushFile(fileData);
    return savedObj;
  }

  @Post('ipfs')
  @ApiOperation({
    summary: 'Upload the base image to ipfs',
    description: 'Upload the base image of this image to ipfs',
  })
  @ApiResponse({
    status: 201,
    description: 'Base image uploaded',
  })
  @ApiResponse({
    status: 503,
    description: 'Server Error',
    type: HttpException,
  })
  saveBaseImageToIpfs() {
    const ipfsPath = this.eventService.saveToIpfs();
    return ipfsPath;
  }
}