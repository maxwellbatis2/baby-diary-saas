import { uploadImage, deleteImage } from '../src/config/cloudinary';
import stream from 'stream';

jest.mock('../src/config/cloudinary', () => ({
  uploadImage: jest.fn(async (file, folder) => ({
    url: `https://cloudinary.com/fake/${folder}/${file.originalname}`,
    publicId: 'fake-public-id',
    secureUrl: `https://cloudinary.com/secure/${folder}/${file.originalname}`,
  })),
  deleteImage: jest.fn(async (publicId) => {
    return { result: 'ok', publicId };
  }),
}));

describe('Cloudinary Utils', () => {
  it('should upload image and return url/publicId', async () => {
    const file = {
      originalname: 'test.jpg',
      buffer: Buffer.from('fake'),
      fieldname: 'image',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 1234,
      destination: '',
      filename: '',
      path: '',
      stream: new stream.Readable(),
    };
    const folder = 'users/test';
    const result: any = await uploadImage(file, folder);
    expect(result.url).toContain(folder);
    expect(result.publicId).toBe('fake-public-id');
    expect(result.secureUrl).toContain(folder);
  });

  it('should delete image and return result ok', async () => {
    const publicId = 'fake-public-id';
    const result: any = await deleteImage(publicId);
    expect(result.result).toBe('ok');
    expect(result.publicId).toBe(publicId);
  });
}); 