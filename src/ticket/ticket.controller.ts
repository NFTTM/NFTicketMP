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
import { FileDataDto } from 'src/dtos/file-data.dto';
import { TicketdataDto } from 'src/dtos/ticket-data.dto';
import { TicketService } from './ticket.service';

@ApiTags('ticket')
@Controller('ticket')
export class TicketController {
  constructor(private readonly ticketService: TicketService) { }

  @Get('/:eventId')
  @ApiOperation({
    summary: 'All tickets sold for the event with this eventId',
    description: 'Gets all tickets stored of this event on this server',
  })
  @ApiResponse({
    status: 200,
    description: 'All tickets',
  })
  @ApiResponse({
    status: 503,
    description: 'The server is not configured correctly',
    type: HttpException,
  })
  async getTickets(@Param('eventId') eventId: number) {
    try {
      const result = this.ticketService.getTickets(eventId);
      return result;
    } catch (error) {
      throw new HttpException(error.message, 503);
    }
  }

  @Post('/:eventId/ticketdata')
  @ApiOperation({
    summary: 'Register ticket metadata',
    description: 'Registers detailed info for a ticket',
  })
  @ApiResponse({
    status: 201,
    description: 'Ticket registered',
  })
  @ApiResponse({
    status: 503,
    description: 'Server Error',
    type: HttpException,
  })
  setTicketData(@Param('eventId') eventId: number, @Body() body: TicketdataDto) {
    const updatedObj = this.ticketService.setTicketData(eventId, body);
    return updatedObj;
  }

  @Post('/:eventId/ticketfile/:ticketId')
  @ApiOperation({
    summary: 'Register an image for this image',
    description: 'Registers an image for this ticket in the database',
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
  uploadFile(@Param('eventId') eventId: number,
    @Param('ticketId') ticketId: number,
    @UploadedFile() file: Express.Multer.File) {
    console.log(file);
    const fileData = new FileDataDto(
      file.originalname,
      file.mimetype,
      file.filename,
      file.size,
    );
    const savedObj = this.ticketService.pushFile(eventId, ticketId, fileData);
    return savedObj;
  }
}
