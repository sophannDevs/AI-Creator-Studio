import { ServiceUnavailableException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AiModule } from './ai.module';
import { AiService } from './ai.service';

describe('AiModule provider selection', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('uses mock provider by default', async () => {
    delete process.env.AI_PROVIDER;
    const module = await Test.createTestingModule({
      imports: [AiModule],
    }).compile();

    const aiService = module.get(AiService);
    const result = await aiService.generateVideoIdeas({
      projectName: 'Backend Developer Channel',
      niche: 'Programming',
      language: 'English',
      targetAudience: 'Junior developers',
      count: 2,
    });

    expect(result.ideas).toHaveLength(2);
    expect(result.ideas[0]?.status).toBe('DRAFT');
  });

  it('selects OpenAI provider when AI_PROVIDER=openai', async () => {
    process.env.AI_PROVIDER = 'openai';
    delete process.env.OPENAI_API_KEY;
    const module = await Test.createTestingModule({
      imports: [AiModule],
    }).compile();

    const aiService = module.get(AiService);

    await expect(
      aiService.generateVideoIdeas({
        projectName: 'Backend Developer Channel',
        niche: 'Programming',
        language: 'English',
        targetAudience: 'Junior developers',
        count: 2,
      }),
    ).rejects.toThrow(ServiceUnavailableException);
  });

  it('fails fast for unsupported provider values', async () => {
    process.env.AI_PROVIDER = 'other-provider';

    await expect(
      Test.createTestingModule({
        imports: [AiModule],
      }).compile(),
    ).rejects.toThrow('Unsupported AI_PROVIDER');
  });
});
