import {
  EXAM_PREVIEW_TEXT,
  OOM_VOICES,
  SCRIPT_PREVIEW_TEXT,
} from "../tts/voiceConfig";
import { useTtsPreferences } from "../tts/useTtsPreferences";

/**
 * REFERENCE ONLY.
 *
 * Codex must map this into the actual STEP 3 component hierarchy and
 * current OOM card/button tokens.
 */
export function VoiceSettingsReference() {
  const {
    preferences,
    setExamVoice,
    setScriptVoice,
  } = useTtsPreferences();

  return (
    <section>
      <header>
        <p>VOICE</p>
        <h2>음성 설정</h2>
        <p>시험 질문과 스크립트 재생 음성을 각각 선택합니다.</p>
      </header>

      <div>
        <h3>시험 질문 음성</h3>
        <div>
          {OOM_VOICES.map((voice) => (
            <button
              type="button"
              key={voice.id}
              aria-pressed={preferences.examVoice === voice.id}
              onClick={() => setExamVoice(voice.id)}
            >
              {voice.label}
            </button>
          ))}
          <button type="button">
            ▶ 미리듣기
          </button>
        </div>
        <small>{EXAM_PREVIEW_TEXT}</small>
      </div>

      <div>
        <h3>스크립트 재생 음성</h3>
        <div>
          {OOM_VOICES.map((voice) => (
            <button
              type="button"
              key={voice.id}
              aria-pressed={preferences.scriptVoice === voice.id}
              onClick={() => setScriptVoice(voice.id)}
            >
              {voice.label}
            </button>
          ))}
          <button type="button">
            ▶ 미리듣기
          </button>
        </div>
        <small>{SCRIPT_PREVIEW_TEXT}</small>
      </div>
    </section>
  );
}
