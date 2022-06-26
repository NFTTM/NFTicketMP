import * as watermark from 'jimp-watermark';

var options = {
  'text': 'Alice  A1234  VIP1',
  'textSize': 6, //Should be between 1-8
  'dstPath': './upload/watermark.png'
};

watermark.addTextWatermark('./upload/superbowl2.jpg', options);