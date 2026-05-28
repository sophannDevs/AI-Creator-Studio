import {
  buildScriptPrompt,
  buildSeoPrompt,
  buildThumbnailPrompt,
  buildVideoIdeaPrompt,
} from './prompt-templates';

describe('prompt templates', () => {
  it('should include key fields for each prompt type', () => {
    const videoIdeaPrompt = buildVideoIdeaPrompt({
      projectName: 'Backend Developer Channel',
      niche: 'Programming',
      language: 'English',
      targetAudience: 'Junior developers',
      description: 'Teaching backend development',
      count: 5,
    });

    const scriptPrompt = buildScriptPrompt({
      projectName: 'Backend Developer Channel',
      niche: 'Programming',
      language: 'English',
      targetAudience: 'Junior developers',
      title: 'Build Secure APIs',
    });

    const seoPrompt = buildSeoPrompt({
      projectName: 'Backend Developer Channel',
      niche: 'Programming',
      language: 'English',
      targetAudience: 'Junior developers',
      title: 'Build Secure APIs',
      targetKeyword: 'NestJS security',
    });

    const thumbnailPrompt = buildThumbnailPrompt({
      projectName: 'Backend Developer Channel',
      niche: 'Programming',
      language: 'English',
      targetAudience: 'Junior developers',
      title: 'Build Secure APIs',
      requestedStyle: 'modern tech YouTube thumbnail',
    });

    expect(videoIdeaPrompt).toContain('Backend Developer Channel');
    expect(videoIdeaPrompt).toContain('Programming');
    expect(videoIdeaPrompt).toContain('Junior developers');

    expect(scriptPrompt).toContain('Build Secure APIs');
    expect(seoPrompt).toContain('Build Secure APIs');
    expect(seoPrompt).toContain('NestJS security');
    expect(thumbnailPrompt).toContain('Build Secure APIs');
    expect(thumbnailPrompt).toContain('modern tech YouTube thumbnail');
  });

  it('should produce stable prompts for same input', () => {
    const input = {
      projectName: 'Backend Developer Channel',
      niche: 'Programming',
      language: 'English',
      targetAudience: 'Junior developers',
      title: 'Build Secure APIs',
    };

    expect(buildScriptPrompt(input)).toEqual(buildScriptPrompt(input));
    expect(buildSeoPrompt(input)).toEqual(buildSeoPrompt(input));
    expect(buildThumbnailPrompt(input)).toEqual(buildThumbnailPrompt(input));
  });
});
