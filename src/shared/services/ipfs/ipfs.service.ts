import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as FormData from 'form-data';
import * as fs from 'fs';
import * as rfs from 'recursive-fs';
import * as basePathConverter from 'base-path-converter';
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

  async saveFolderToIpfs(src: string) {
    try {
      const { dirs, files } = await rfs.read(src);
      if (files.length < 2)
        setTimeout(() => {console.log("Waiting 2 seconds for ticket image beeing created")}, 2000);
      console.log(files);
      let data = new FormData();
      for (const file of files) {
        data.append(`file`, fs.createReadStream(file), {
          filepath: basePathConverter(src, file),
        });
      }
  
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
    } catch (error) {
      throw error;
    }
  }
}
