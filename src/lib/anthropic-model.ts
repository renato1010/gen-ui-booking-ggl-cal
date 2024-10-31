import { ChatAnthropic } from "@langchain/anthropic";
import { Resource } from "sst";

// create a singleton of ChatAnthropic Class

export class ChatAnthropicSingleton {
  private static instance: ChatAnthropic;

  private constructor() {} // Prevent direct construction

  static getInstance(): ChatAnthropic {
    if (!this.instance) {
      this.instance = new ChatAnthropic({
        model: 'claude-3-5-sonnet-20240620',
        apiKey: Resource.AnthropicSecret.value,
        temperature: 0
      });
    }
    return this.instance;
  }
}