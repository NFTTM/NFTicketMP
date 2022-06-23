import { ApiProperty } from "@nestjs/swagger";

export class TicketdataDto {
  @ApiProperty({
    required: true,
    description: 'Owner name of this ticket',
    examples: ['Celine Dion', 'Alice'],
  })
  ownername: string;
  @ApiProperty({
    required: true,
    description: 'Owner account address of this ticket',
    example: '0xjdkfkgbdbdbdbnrenmeekoeokvmn',
  })
  account: string;
  @ApiProperty({
    required: true,
    description: 'Price of this ticket',
    example: '10',
  })
  price: number;
  @ApiProperty({
    required: true,
    description: 'Seat location of this ticket',
    example: 'A13',
  })
  seat: string;
  @ApiProperty({
    required: true,
    description: 'Ticket type',
    examples: ['VIP', 'Class 1', 'Class 3'],
  })
  type: 'VIP';
  @ApiProperty({
    required: true,
    description: 'Status of this ticket',
    example: ['Available', 'Used', 'Expired'],
  })
  status: string;
}