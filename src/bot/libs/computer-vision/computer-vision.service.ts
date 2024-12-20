import { Injectable } from '@nestjs/common';
import {
  DocumentAnalysisClient,
  AzureKeyCredential,
} from '@azure/ai-form-recognizer';
import * as fs from 'fs';
import { getTextOfSpans } from './utils/utils';
import { PrebuiltReadModel } from './models/prebuild-read';

@Injectable()
export class ComputerVisionService {
  private client: DocumentAnalysisClient;

  constructor() {
    // AZURE_FORM_RECOGNIZER_ENDPOINT=https://sponsor-checkforms-formrecognizer.cognitiveservices.azure.com/
    // API_KEY_AZURE=bb203ad74f574215968f261296377fe2
    const endpoint = 'https://sponsor-checkforms-formrecognizer.cognitiveservices.azure.com/';
    const apiKey = 'bb203ad74f574215968f261296377fe2';
    console.log({ endpoint, apiKey });
    this.client = new DocumentAnalysisClient(
      endpoint,
      new AzureKeyCredential(apiKey),
    );
  }

  async analyzeDocumentFromURL(path: string) {
    const poller = await this.client.beginAnalyzeDocumentFromUrl(
      PrebuiltReadModel,
      path,
    );

    const { content, pages, languages } = await poller.pollUntilDone();

    return {
      content,
      pages: this.extractPageInfo(pages),
      languages: this.extractLanguageInfo(content, languages),
    };
  }

  async analyzeDocumentFromFile(pathSystem: string) {
    const readStream = fs.createReadStream(pathSystem);
    const poller = await this.client.beginAnalyzeDocument(
      PrebuiltReadModel,
      readStream,
    );
    const { content, pages, languages } = await poller.pollUntilDone();

    return {
      content,
      pages: this.extractPageInfo(pages),
      languages: this.extractLanguageInfo(content, languages),
    };
  }

  async analyzeDocumentFromBase64(base64: string) {
    const poller = await this.client.beginAnalyzeDocument(
      PrebuiltReadModel,
      Buffer.from(base64, 'base64'),
    );
    const { content, pages, languages } = await poller.pollUntilDone();

    return {
      content,
      pages: this.extractPageInfo(pages),
      languages: this.extractLanguageInfo(content, languages),
    };
  }

  private extractPageInfo(pages: any[]) {
    if (!pages || pages.length <= 0) {
      return 'No pages were extracted from the document.';
    }

    return pages.map((page) => ({
      pageNumber: page.pageNumber,
      dimensions: { width: page.width, height: page.height },
      angle: page.angle,
      lines: page.lines ? page.lines.map((line) => line.content) : [],
    }));
  }

  private extractLanguageInfo(content: string, languages: any[]) {
    if (!languages || languages.length <= 0) {
      return 'No language spans were extracted from the document.';
    }

    return languages.map((languageEntry) => ({
      locale: languageEntry.locale,
      confidence: languageEntry.confidence,
      texts: [...getTextOfSpans(content, languageEntry.spans)].map((text) =>
        text.replace(/\r?\n/g, '\\n').replace(/"/g, '\\"'),
      ),
    }));
  }
}
