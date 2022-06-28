# NFTicketMP
This is the backend for the NFT ticket market place project.

# Ticketing Process
Before buyer buys a ticket, organizer needs to create an event.
1. `POST /event/eventdata` Create an event by registering metadata. Parameters example:
```{
  "name": "Super Bowl 2023",
  "place": "Rogers Place, 112 Street, 88 Ave",
  "startAt": 1655917396,
  "endAt": 1655927412,
  "totalSeats": 400,
  "organizer": "Event organizer company",
  "description": "This is the super bowl 2023 Feb 12, State Farm Stadium."
}
```
2. `POST /event/file` Upload a base image for genrating ticket.
3. `POST /event/ipfs` (optional) Upload the base image to ipfs via Pinata.
4. `POST /ticket` Buyer fills in signature message to verify legitimaty. Once pass, backend will generate a ticket image for buyer. Parameter example:
```
{
  "address": "0xFa4270bf86D4c092F03c768D474D2193b9A39edd",
  "name": "Fred",
  "id": "F0821",
  "ticketType": "VIP2",
  "buySignature": "0x5238ca21e13c664206926d7d0b8c672a8651eb52e6a085aee33b60f65d19d67a5db70db9bc6c44d88b7a4a386f2908324c9432d0aca894958f4e46aed2f963581b",
  "checkinSignature": ""
}
```
`checkinSignature` remains empty untill the attendee has been checked in.

5. `GET /ticket/{walletAddress}` Buyer requests a ticket in the form of an IPFS URI by providing the wallet address.

6. `POST /ticket/check-in` Buyer checks in the ticket. Backend verifies the legitimaty of buyer and changes the checkedIn status to true on blockchain. Parameters example:
```
{
  "address": "0xFa4270bf86D4c092F03c768D474D2193b9A39edd",
  "requestCheckin": true,
  "signedHashForCheckin": "0x1bc309e424e01ae55d54249b0b5429fd089baf7583b8a2b1f6f60322df22abb93972b0ebb3199e911bcb1c462e7e60f92d02cb696c68f6fe7c5c0d544bba98f51b"
}
```
After ticket is checked in, backend return `true` and `checkinSignature` will be filled. When check the same ticket again, backend returns `false`.
