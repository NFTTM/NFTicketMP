import axios from 'axios';
import * as FormData from 'form-data';
import * as fs from 'fs';

async function main() {
  const pinataContent = {
    "name": "Alice",
    "id": "A1234",
    "ticketType": "VIP2",
    "signedHash": "ticketInfo.buySignature",
    "imageUri": "bafkreiazrmp6jtg6mmghgswcfip7qwjvxuxlgjr6odwayqb2auyt62aili"
  }
  var data = JSON.stringify({
    "pinataOptions": {
      "cidVersion": 1
    },
    // "pinataMetadata": {
    //   "name": "ticketInfo.json",
    //   "keyvalues": {
    //     "auther": "Team F",
    //     "year": "2022"
    //   }
    // },
    "pinataContent": pinataContent
  });

  var config = {
    method: 'post',
    url: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIzMzdjMjRiNy1iNTUwLTQwOWMtODI3My03YWQ3OGZhM2NiNzciLCJlbWFpbCI6ImNhaXhpYW5nQHVhbGJlcnRhLmNhIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siaWQiOiJGUkExIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9LHsiaWQiOiJOWUMxIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjE3MzRjNTIwZTk2ZjA0MjdjMGY0Iiwic2NvcGVkS2V5U2VjcmV0IjoiYTIyY2FjOTQ4ODM2OTc1NGJmMzYwZjQ3ZTRjZDBhOGVkN2JjNDUwNGRhYzFhNjNhNzNhYWM2ZDFkYzQ2YTcxNiIsImlhdCI6MTY1NjAyMjQ0NX0.LOAotFROE8KOl7FOHl58IpOckswnmLtpOumAt1T3zBw'
    },
    data: data
  };

  const res = await axios(config);

  console.log(res.data);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
