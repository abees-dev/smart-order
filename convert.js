import sharp from 'sharp';

sharp('./public/icon.png')
  .resize(180, 180)
  .png()
  .toFile('apple-touch-icon.png')
  .then(() => console.log('Đã tạo xong apple-touch-icon.png!'))
  .catch((err) => console.error(err));
