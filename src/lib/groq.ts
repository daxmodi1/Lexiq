import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface WordLookupResult {
  word: string;
  definition: string;
  synonyms: string[];
  antonyms: string[];
  word_family: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'rare';
  part_of_speech: string;
  phonetic: string;
  examples: string[];
}

const WORD_LOOKUP_PROMPT = `You are a comprehensive dictionary and vocabulary expert. Given a word, return a detailed JSON object with the following fields:

{
  "word": "the word in lowercase",
  "definition": "a clear, concise, medium-length primary definition (maximum 2 sentences, 15-25 words)",
  "synonyms": ["synonym1", "synonym2", "synonym3", "synonym4", "synonym5"],
  "antonyms": ["antonym1", "antonym2", "antonym3"],
  "word_family": ["related form 1", "related form 2", "related form 3"],
  "difficulty": "one of: beginner, intermediate, advanced, rare",
  "part_of_speech": "primary part of speech (noun, verb, adjective, adverb, etc.)",
  "phonetic": "IPA pronunciation notation",
  "examples": ["example sentence 1 using the word naturally", "example sentence 2", "example sentence 3"]
}

Rules:
- definition MUST be medium length: not too short, but not a paragraph. Aim for 15-25 words.
- difficulty should be based on word frequency: top 5000 = beginner, academic/professional = intermediate, literary/discipline-specific = advanced, archaic/obscure = rare
- examples should be natural, varied, and show different contexts
- Return ONLY the JSON object, no markdown, no commentary`;

export async function lookupWord(word: string): Promise<WordLookupResult> {
  const completion = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: WORD_LOOKUP_PROMPT },
      { role: 'user', content: `Look up the word: "${word}"` },
    ],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.3,
    max_tokens: 1024,
    response_format: { type: 'json_object' },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error('No response from Groq API');

  return JSON.parse(content) as WordLookupResult;
}

export async function generateRandomWord(): Promise<WordLookupResult> {
  const completion = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: WORD_LOOKUP_PROMPT },
      { role: 'user', content: 'Generate a random, interesting, and useful English vocabulary word that is at an intermediate or advanced level. Do not repeat very common words. Please ensure it is a real English word. Return the full JSON object for the word as requested.' },
    ],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.9,
    max_tokens: 1024,
    response_format: { type: 'json_object' },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error('No response from Groq API');

  return JSON.parse(content) as WordLookupResult;
}

export async function generateFillInTheBlank(
  word: string,
  definition: string
): Promise<{ sentence: string; hint: string }> {
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: `Generate a fill-in-the-blank question for vocabulary practice. Return JSON:
{
  "sentence": "A complete sentence with [____] where the target word should go",
  "hint": "A brief 2-3 word hint about the word's meaning"
}
Return ONLY JSON.`,
      },
      {
        role: 'user',
        content: `Word: "${word}" (Definition: ${definition})`,
      },
    ],
    model: 'llama-3.1-8b-instant',
    temperature: 0.7,
    max_tokens: 256,
    response_format: { type: 'json_object' },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error('No response from Groq API');

  return JSON.parse(content);
}

export async function gradeAnswer(
  word: string,
  userAnswer: string,
  definition: string
): Promise<{ is_correct: boolean; explanation: string }> {
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: `You are grading a vocabulary quiz answer. The correct word is provided. Check if the user's answer matches, accepting:
- Minor spelling variations (1-2 letter differences)
- Different verb tenses of the same word
- The word with or without common suffixes

Return JSON: { "is_correct": boolean, "explanation": "brief explanation" }
Return ONLY JSON.`,
      },
      {
        role: 'user',
        content: `Correct word: "${word}" (meaning: ${definition})\nUser answer: "${userAnswer}"`,
      },
    ],
    model: 'llama-3.1-8b-instant',
    temperature: 0.1,
    max_tokens: 128,
    response_format: { type: 'json_object' },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error('No response from Groq API');

  return JSON.parse(content);
}
