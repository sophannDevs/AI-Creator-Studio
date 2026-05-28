import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { MockAiProvider } from './providers/mock-ai.provider';
import { AI_PROVIDER_TOKEN } from './providers/ai-provider.token';
import { OpenAiProvider } from './providers/openai-ai.provider';

@Module({
  providers: [
    MockAiProvider,
    OpenAiProvider,
    {
      provide: AI_PROVIDER_TOKEN,
      useFactory: (
        mockProvider: MockAiProvider,
        openAiProvider: OpenAiProvider,
      ) => {
        const provider = (process.env.AI_PROVIDER ?? 'mock')
          .trim()
          .toLowerCase();

        if (provider === 'mock') {
          return mockProvider;
        }

        if (provider === 'openai') {
          return openAiProvider;
        }

        throw new Error(
          `Unsupported AI_PROVIDER "${provider}". Currently supported: mock, openai.`,
        );
      },
      inject: [MockAiProvider, OpenAiProvider],
    },
    AiService,
  ],
  exports: [AiService],
})
export class AiModule {}
