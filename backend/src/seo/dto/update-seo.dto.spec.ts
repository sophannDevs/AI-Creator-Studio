import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateSeoDto } from './update-seo.dto';

describe('UpdateSeoDto', () => {
  it('accepts valid arrays and score range', async () => {
    const dto = plainToInstance(UpdateSeoDto, {
      title: 'SEO title',
      description: 'SEO description',
      tags: ['docker', 'java backend'],
      hashtags: ['#Docker', '#JavaBackend'],
      seoScore: 100,
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects seoScore above 100', async () => {
    const dto = plainToInstance(UpdateSeoDto, {
      seoScore: 101,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects non-array tags', async () => {
    const dto = plainToInstance(UpdateSeoDto, {
      tags: 'docker',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
