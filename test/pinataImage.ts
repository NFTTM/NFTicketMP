import axios from 'axios';
import * as FormData from 'form-data';
import * as fs from 'fs';

async function main() {
  var data = new FormData();
  data.append('file', fs.createReadStream('./upload/5c445a416c9781173c2c80bc2079d35c'));
  data.append('pinataOptions', '{"cidVersion": 1}');
  data.append('pinataMetadata', '{"name": "ticketBaseImage", "keyvalues": {"author": "Team F"}}');

  var config = {
    method: 'post',
    url: 'https://api.pinata.cloud/pinning/pinFileToIPFS',
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIzMzdjMjRiNy1iNTUwLTQwOWMtODI3My03YWQ3OGZhM2NiNzciLCJlbWFpbCI6ImNhaXhpYW5nQHVhbGJlcnRhLmNhIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siaWQiOiJGUkExIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9LHsiaWQiOiJOWUMxIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjE3MzRjNTIwZTk2ZjA0MjdjMGY0Iiwic2NvcGVkS2V5U2VjcmV0IjoiYTIyY2FjOTQ4ODM2OTc1NGJmMzYwZjQ3ZTRjZDBhOGVkN2JjNDUwNGRhYzFhNjNhNzNhYWM2ZDFkYzQ2YTcxNiIsImlhdCI6MTY1NjAyMjQ0NX0.LOAotFROE8KOl7FOHl58IpOckswnmLtpOumAt1T3zBw',
      ...data.getHeaders()
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
