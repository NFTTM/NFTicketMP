import { ApiProperty } from "@nestjs/swagger";

export class EventdataDto {
  eventData(eventData: any) {
    throw new Error('Method not implemented.');
  }
  @ApiProperty({
    required: true,
    description: 'Name of this event',
    example: "Super Bowl 2023",
  })
  name: string;
  @ApiProperty({
    required: true,
    description: 'Place of the event',
    example: 'Rogers Place, 112 Street, 88 Ave',
  })
  place: string;
  @ApiProperty({
    required: true,
    description: 'Start timestamp of this event',
    example: '1655917396',
  })
  startAt: number;
  @ApiProperty({
    required: true,
    description: 'End timestamp of this event',
    example: '1655927412',
  })
  endAt: number;
  @ApiProperty({
    required: true,
    description: 'Total seats or tickets of this event',
    examples: [5000, 300, 1000],
  })
  totalSeats: number;
  @ApiProperty({
    required: false,
    description: 'Organizer of this event',
    example: 'Event organizer company',
  })
  organizer?: string;
  @ApiProperty({
    required: false,
    description: 'Descreption of the event',
    example: 'This is the super bowl 2023 Feb 12, State Farm Stadium.'
  })
  description?: string;
}