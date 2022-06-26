import { ApiProperty } from "@nestjs/swagger";

export class TicketCheckinDto {
  @ApiProperty({
    required: true,
    description: 'Address that will receive the ticket token',
    example: '0x6a9b60d873275458ea0c4590eBFcED09d9969F56',
    minLength: 42,
    maxLength: 42,
  })
  address: string;

  @ApiProperty({
    required: true,
    description: 'Indicator if request check-in or not',
    example: true,
  })
  requestCheckin: boolean;

  @ApiProperty({
    required: true,
    description: 'Signature payload',
    example: '0x3603b348361238aa5adf8a3c16622caa9cb4962c2583bb484d29253c6e8d594f72029f8765c76eac95dbd6d476af871c37aef119ccf1ac094bfd1e49c4de719c1c',
  })
  signedHashForCheckin: string;
}