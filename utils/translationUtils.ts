import axios, { AxiosResponse } from 'axios';

interface TranslationResponse {
  translations: {
    text: string;
    to: string;
  }[];
}

const key = process.env["AZURE_TRANSLATOR_API_KEY"];
const region = process.env["AZURE_TRANSLATOR_REGION"];
const endpoint = 'https://api.cognitive.microsofttranslator.com/translate?api-version=3.0'

class TranslationUtils {

  static async translateText(text: string, from: string, to: string, abortController: AbortController): Promise<string> {
    const requestBody = [
      {
        text: text,
      },
    ];

    try {
      console.log('1', endpoint)
      const response: AxiosResponse<TranslationResponse[]> = await axios.post(
        endpoint,
        requestBody,
        {
          headers: {
            'Ocp-Apim-Subscription-Key': key,
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Region': region,
          },
          params: {
            from: from,
            to: to,
          },
          signal: abortController.signal,
        }
      );
      console.log(response)

      return response.data[0].translations[0].text;
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request canceled', error.message);
      } else {
        console.error('Error translating text:', error);
      }
      throw new Error('Translation failed');
    }
  }
}

export default TranslationUtils;