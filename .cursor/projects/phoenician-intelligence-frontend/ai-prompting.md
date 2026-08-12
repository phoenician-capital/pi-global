# AI — phoenician-intelligence-frontend

No local model calls for DD generation. FE triggers jobs via .NET → Python; displays reports/H2H/risk PDF exports (`src/services/*PdfExport*`). TTS: OpenAI speech via `src/tts/openAiSpeech.ts` (voice key `pi.tts.openAiVoice`). Prompt lab / brain UIs hit backend APIs — see PI `brain-skills.md` and systems `ai-prompting-map.md`.
