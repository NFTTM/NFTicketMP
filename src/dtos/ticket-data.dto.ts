import { ApiProperty } from "@nestjs/swagger";

export class TicketdataDto {
  @ApiProperty({
    required: true,
    description: 'Owner name of this ticket',
    examples: ['Celine Dion', 'Alice'],
  })
  name: string;
  
  @ApiProperty({
    required: true,
    description: 'Ticket ID',
    examples: ['A1234', 'B2345'],
  })
  id: string;

  @ApiProperty({
    required: true,
    description: 'Ticket type',
    examples: ['VIP', 'Class 1', 'Class 3'],
  })
  ticketType: string;
  // @ApiProperty({
  //   required: false,
  //   description: 'Price of this ticket',
  //   example: '10',
  // })
  // price: number;
  // @ApiProperty({
  //   required: false,
  //   description: 'Seat location of this ticket',
  //   example: 'A13',
  // })
  // seat: string;
}