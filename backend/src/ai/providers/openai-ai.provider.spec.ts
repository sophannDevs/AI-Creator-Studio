import { ServiceUnavailableException } from '@nestjs/common';
import { APIConnectionTimeoutError } from 'openai';
import { OpenAiProvider } from './openai-ai.provider';

describe('OpenAiProvider', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('throws a safe error when OPENAI_API_KEY is missing', async () => {
    delete process.env.OPENAI_API_KEY;
    const provider = new OpenAiProvider();

    await expect(
      provider.generateVideoIdeas(
        {
          projectName: 'Backend Developer Channel',
          niche: 'Programming',
          language: 'English',
          targetAudience: 'Junior developers',
          count: 3,
        },
        'Generate ideas',
      ),
    ).rejects.toThrow(ServiceUnavailableException);
  });

  it('returns validated structured output', async () => {
    process.env.OPENAI_API_KEY = 'test-key';
    const provider = new OpenAiProvider();
    const parse = jest.fn().mockResolvedValue({
      output_parsed: {
        title: 'Docker for Java Developers',
        description: 'A practical Docker guide for Java backend developers.',
        tags: ['docker', 'java', 'backend'],
        hashtags: ['#Docker', '#JavaBackend'],
        seoScore: 91,
      },
    });

    setMockClient(provider, parse);

    const result = await provider.generateSeo(
      {
        projectName: 'Backend Developer Channel',
        niche: 'Programming',
        language: 'English',
        targetAudience: 'Junior developers',
        title: 'Docker Basics',
        targetKeyword: 'Docker for Java developers',
      },
      'Generate SEO',
    );

    expect(result.seoScore).toBe(91);
    expect(result.tags).toEqual(['docker', 'java', 'backend']);
    expect(parse).toHaveBeenCalledTimes(1);
  });

  it('rejects invalid structured output with a safe error', async () => {
    process.env.OPENAI_API_KEY = 'test-key';
    const provider = new OpenAiProvider();
    const parse = jest.fn().mockResolvedValue({
      output_parsed: {
        title: 'Bad SEO',
        description: 'Score is out of range.',
        tags: ['seo'],
        hashtags: ['#SEO'],
        seoScore: 200,
      },
    });

    setMockClient(provider, parse);

    await expect(
      provider.generateSeo(
        {
          projectName: 'Backend Developer Channel',
          niche: 'Programming',
          language: 'English',
          targetAudience: 'Junior developers',
          title: 'Docker Basics',
        },
        'Generate SEO',
      ),
    ).rejects.toThrow(ServiceUnavailableException);
  });

  it('handles OpenAI timeout with a safe error', async () => {
    process.env.OPENAI_API_KEY = 'test-key';
    const provider = new OpenAiProvider();
    const timeoutError = new Error('timeout');
    Object.setPrototypeOf(timeoutError, APIConnectionTimeoutError.prototype);
    const parse = jest.fn().mockRejectedValue(timeoutError);

    setMockClient(provider, parse);

    await expect(
      provider.generateThumbnailPrompt(
        {
          projectName: 'Backend Developer Channel',
          niche: 'Programming',
          language: 'English',
          targetAudience: 'Junior developers',
          title: 'Docker Basics',
        },
        'Generate thumbnail',
      ),
    ).rejects.toThrow(ServiceUnavailableException);
  });
});

function setMockClient(provider: OpenAiProvider, parse: jest.Mock): void {
  (
    provider as unknown as {
      client: { responses: { parse: jest.Mock } };
    }
  ).client = {
    responses: {
      parse,
    },
  };
}
