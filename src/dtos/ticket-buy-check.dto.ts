import { ApiProperty } from "@nestjs/swagger";

export class TicketBuyCheckDto {
  @ApiProperty({
    required: true,
    description: 'Address that will receive the ticket token',
    example: '0x74121B1461631a021Dd36528baeBeCB45e61552f',
    minLength: 42,
    maxLength: 42,
  })
  address: string;

  @ApiProperty({
    required: true,
    description: 'Stringified information, e.g., name, id, ticketType',
    example: "{'name': 'alice', 'id': 'A1234', 'ticketType': 'VIP1'}",
  })
  ticketInfo: string;

  @ApiProperty({
    required: true,
    description: 'Signature payload',
  })
  signature: string;
}