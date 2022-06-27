export class IpfsDataDto {
  constructor(
    public IpfsHash: string,
    public PinSize: number,
    public Timestamp: string,
    public isDuplicate?: boolean,
  ) { }
}
