
export enum Mentor {
  GREG_DEAN = 'Greg Dean',
  LEO_LINS = 'Léo Lins'
}

export interface JokeSession {
  id: string;
  title: string;
  setup: string;
  punchline: string;
  notes: string;
  mentorFeedback?: string;
  tags: string[];
}

export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  content: string;
}

export interface MediaAsset {
  id: string;
  type: 'image' | 'video';
  url: string;
  prompt: string;
}

export interface TranscriptionItem {
  timestamp: number;
  text: string;
  speaker: 'user' | 'ai';
}
