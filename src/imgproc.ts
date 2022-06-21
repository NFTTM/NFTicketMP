import watermark from 'jimp-watermark';

const options = {
    'text': 'Team F Watermark',
    'textSize': 8,
    'dstPath': './images/1-watermarked.jpg'
};

watermark.addTextWatermark('./images/1.jpg', options).then(data => {
    console.log(data);
}).catch(err => {
    console.log(err);
});