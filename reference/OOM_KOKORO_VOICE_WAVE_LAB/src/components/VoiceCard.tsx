import type { GeneratedClip, LabMode, VoiceCandidate, WaveStyle } from "../lib/types";
import { Rating } from "./Rating";
import { WavePlayer } from "./WavePlayer";

type Props = {
  candidate: VoiceCandidate;
  mode: LabMode;
  clip?: GeneratedClip;
  waveStyle: WaveStyle;
  loading: boolean;
  rating: number;
  selectedExam: boolean;
  selectedScript: boolean;
  onGenerate: () => void;
  onRate: (score: number) => void;
  onPickExam: () => void;
  onPickScript: () => void;
};

export function VoiceCard({
  candidate,
  mode,
  clip,
  waveStyle,
  loading,
  rating,
  selectedExam,
  selectedScript,
  onGenerate,
  onRate,
  onPickExam,
  onPickScript,
}: Props) {
  return (
    <article className="voice-card">
      <div className="voice-card-top">
        <div>
          <div className="voice-id">{candidate.id}</div>
          <h3>{candidate.label}</h3>
        </div>
        <span className="grade">Kokoro {candidate.grade}</span>
      </div>

      <p className="voice-note">{candidate.note}</p>

      {clip ? (
        <>
          <WavePlayer
            blob={clip.blob}
            style={waveStyle}
            accent={mode === "exam" ? "cyan" : "violet"}
          />
          <div className="clip-meta">
            <span>{(clip.elapsedMs / 1000).toFixed(1)}초 생성</span>
            <span>{clip.speed.toFixed(2)}×</span>
          </div>
        </>
      ) : (
        <div className="wave-placeholder">
          <div className="placeholder-bars" aria-hidden="true">
            {Array.from({ length: 42 }).map((_, index) => (
              <i
                key={index}
                style={{
                  height: `${16 + ((index * 17) % 43)}%`,
                }}
              />
            ))}
          </div>
          <span>음성을 생성하면 실제 파형이 표시됩니다.</span>
        </div>
      )}

      <div className="voice-card-actions">
        <button
          type="button"
          className="secondary-button"
          onClick={onGenerate}
          disabled={loading}
        >
          {loading ? "생성 중…" : clip ? "다시 생성" : "이 음성 생성"}
        </button>

        <Rating value={rating} onChange={onRate} />
      </div>

      <div className="pick-row">
        <button
          type="button"
          className={selectedExam ? "pick-button is-picked" : "pick-button"}
          onClick={onPickExam}
        >
          {selectedExam ? "✓ 시험 음성 선택됨" : "시험 음성으로 선택"}
        </button>
        <button
          type="button"
          className={selectedScript ? "pick-button is-picked" : "pick-button"}
          onClick={onPickScript}
        >
          {selectedScript ? "✓ 스크립트 음성 선택됨" : "스크립트 음성으로 선택"}
        </button>
      </div>
    </article>
  );
}
