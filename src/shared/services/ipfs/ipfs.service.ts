import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as FormData from 'form-data';
import * as fs from 'fs';

@Injectable()
export class IpfsService {
  pinataFileURL: string;
  pinataJsonURL: string;
  pinataJWT: string;

  constructor() {
    this.pinataFileURL = process.env.PINATA_FILE_URL;
    this.pinataJsonURL = process.env.PINATA_JSON_URL;
    this.pinataJWT = process.env.PINATA_JWT;
  }

  async saveFileToIpfs(filePath: string) {
    var data = new FormData();
    data.append('file', fs.createReadStream(filePath));
    data.append('pinataOptions', '{"cidVersion": 1}');
    var config = {
      method: 'post',
      url: this.pinataFileURL,
      headers: {
        'Authorization': `Bearer ${this.pinataJWT}`,
        ...data.getHeaders()
      },
      data: data
    };

    const res = await axios(config);
    return res.data;
  }

  async saveJsonToIpfs(pinataContent: object) {
    var data = JSON.stringify({
      "pinataOptions": {
        "cidVersion": 1
      },
      "pinataContent": pinataContent
    });

    var config = {
      method: 'post',
      url: this.pinataJsonURL,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.pinataJWT}`
      },
      data: data
    };

    const res = await axios(config);
    return res.data;
  }
}
