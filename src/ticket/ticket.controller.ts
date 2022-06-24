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
import { TicketBuyCheckDto } from 'src/dtos/ticket-buy-check.dto';
import { TicketdataDto } from 'src/dtos/ticket-data.dto';
import { TicketService } from './ticket.service';

@ApiTags('ticket')
@Controller('ticket')
export class TicketController {
  constructor(private readonly ticketService: TicketService) { }

  @Post('')
  @ApiOperation({
    summary: 'Check signature validity before minting a ticket token',
    description:
      'Requests the server to check the signature validity before minting a ticket token',
  })
  @ApiResponse({
    status: 201,
    description: 'Signature check pass',
    type: Number,
  })
  @ApiResponse({
    status: 401,
    description: 'Missing signature',
    type: HttpException,
  })
  @ApiResponse({
    status: 403,
    description: 'Wrong signature',
    type: HttpException,
  })
  @ApiResponse({
    status: 500,
    description: 'Invalid signature',
    type: HttpException,
  })
  async checkBuyerSignature(@Body() ticketBuyCheckDto: TicketBuyCheckDto) {
    const signature = ticketBuyCheckDto.signature;
    if (!signature || signature.length == 0)
      throw new HttpException('Missing signature', 401);
    let signatureValid = false;
    try {
      signatureValid = this.ticketService.checkSignature(
        ticketBuyCheckDto.address,
        ticketBuyCheckDto.ticketInfo,
        signature,
      );
    } catch (error) {
      throw new HttpException("Invalid signature: " + error.message, 500);
    }
    if (!signatureValid) throw new HttpException('Signature does not match with the requested address', 403);
    return signatureValid;
  }

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
