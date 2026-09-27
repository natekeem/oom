# Managed STT & Speaking Loop — Phase 3.2

## Boundary and ownership

OOM Phase 3.2 completes the core speaking-learning loop:
$$\text{Question} \longrightarrow \text{Record answer} \longrightarrow \text{STT transcription} \longrightarrow \text{Learner reviews/edits transcript} \longrightarrow \text{AI feedback} \longrightarrow \text{KEEP / FIX / RETRY} \longrightarrow \text{Retry speaking}$$

Speech-to-text (STT) is available out-of-the-box without requiring learners to configure personal API keys.

### Provider Resolution Precedence
Every transcription request passes through `runStt` in `src/features/stt/runStt.ts`:
1. **Custom STT (User-configured)**: If `sttSettings.endpoint` is present and non-empty, it always wins. The browser calls the user's OpenAI-compatible Whisper/STT endpoint directly.
2. **Browser Local On-device STT (Optional)**: If `preferLocalOnDevice` is enabled AND the browser verifies true on-device speech recognition (`isLocalOnDeviceSttSupported()` checking `processLocally`), it runs locally without transmitting audio. Ordinary server-backed Web Speech is never labeled as local.
3. **OOM Managed STT (Default)**: Otherwise, the request calls the OOM Edge Function `stt-api/transcribe` $\rightarrow$ Gemini 3.5 Transcribe.

**Strict Invariant**: Providers **never** fall back to each other if one fails. A custom endpoint failure returns a custom failure alert; a managed failure returns a managed alert.

### Code Ownership
- `shared/stt/types.ts`: Environment-neutral STT contracts, error codes, quota limits, and duration boundaries.
- `src/features/stt/`: Frontend provider resolver, errors, custom provider, browser local provider, managed client, settings cards (`ManagedSttSettings`, `BrowserLocalSttCard`).
- `supabase/functions/stt-api/`: Deno Edge Function with bounded multipart parsing, audio validation, atomic reservation/finalization RPCs, and Gemini Files + Interactions API integration (`provider.ts`, `handler.ts`).
- `supabase/functions/admin-api/handlers/stt.ts`: Operational metrics, settings management, and usage log querying for STT.
- `src/features/admin/AdminSttSection.tsx`: Admin console tab for STT metrics, Gemini model selection, daily duration quotas, and usage logs.
- `src/components/practice/`: Quick Practice and Full Mock post-exam review integration with editable transcripts and KEEP/FIX/RETRY feedback.

---

## Database Architecture

Migration: `supabase/migrations/20260927000000_managed_stt_platform.sql`.

| Table | Purpose |
| --- | --- |
| `stt_runtime_settings` | Singleton configuration: `managed_stt_enabled` (default `false`), `default_model` (`gemini-3.5-transcribe`), burst limit (10/min) |
| `stt_plan_limits` | Daily duration limits: FREE 10 min (600,000 ms), future PRO 60 min (3,600,000 ms) |
| `stt_model_catalog` | Catalog of allowed STT models with pricing metadata (`cost_per_minute_microusd`) |
| `stt_usage_buckets` | Daily duration buckets per user in Asia/Seoul date boundaries (`used_duration_ms`, `reserved_duration_ms`) |
| `stt_usage_events` | Individual STT request tracking with audio hash, duration, latency, estimated cost, and status |
| `stt_results` | Transient (24-hour TTL) result storage for idempotency recovery without persisting raw audio |

### Security & Privacy Rules
- **Zero Raw Audio Persistence**: Neither the database nor Supabase Storage ever stores audio blobs or audio files. Audio files uploaded to the Gemini Files API are deleted immediately in a `finally` block upon completion of the transcription request.
- **Transient Transcripts**: `stt_results` keeps transcripts for 24 hours solely for idempotent retry and AI feedback alignment; rows older than 24 hours expire automatically.
- **Isolated Advisory Lock**: STT duration quota transactions acquire lock `hashtextextended(p_user::text, 3201)`. This is completely isolated from Managed AI's lock (`3101`), preventing STT and LLM concurrency contention for the same user.
- **RLS & Security Privileges**: All STT tables have Row Level Security enabled with all browser privileges revoked. Functions have empty `search_path` and execute permissions restricted to `service_role`.

---

## Transcription & Provider Rules

### Audio Constraints
- **Maximum File Size**: 25 MB.
- **Allowed MIME Types**: `audio/webm`, `audio/mp4`, `audio/wav`, `audio/ogg`, `audio/x-m4a`, `audio/aac`, `video/webm`, `video/mp4`.
- **Duration Constraints**: Minimum 500 ms; maximum 180 seconds for Quick Practice and Full Mock, 120 seconds for Roleplay.

### Gemini 3.5 Transcribe Configuration
- Dedicated transcription model: `gemini-3.5-transcribe`.
- Interactions API: `POST https://generativelanguage.googleapis.com/v1beta/interactions`.
- Configuration:
  - `mode: "verbatim"` (preserves fillers `um`, `uh`, false starts, and repetitions essential for OPIc speaking evaluation).
  - `language_code: "en-US"`.
  - Speech hints: `["OPIc", "AL", "IH", "IM1", "IM2", "IM3"]`.
- Files API media upload:
  - `POST https://generativelanguage.googleapis.com/upload/v1beta/files?uploadType=media`.
  - Immediate file deletion in `finally`: `DELETE https://generativelanguage.googleapis.com/v1beta/{file.name}`. File URIs are never exposed to the client.

---

## Learner UX & Speaking Loop

1. **Quick Practice**:
   - Answer recorded $\rightarrow$ audio blob stored in browser memory only.
   - Learner clicks "음성을 텍스트로 변환" (or automatic transcription if enabled).
   - STT status updates: `"transcribing"` $\rightarrow$ `"success"` with label "전사 완료".
   - Learner can directly edit the transcript in the textarea. The status dynamically changes to "직접 수정됨" with label "수정된 전사".
   - Learner requests AI Feedback: sends the verified/edited transcript text to `answer_feedback`. No raw audio is sent to the LLM.
2. **Full Mock Practice**:
   - Strictly exam-pure: No STT or AI is called or visible during the 40-minute mock exam.
   - Post-Exam Review: On the "답변 복기" tab, learners can transcribe selected saved answers, review/edit text, and request targeted AI feedback.
3. **Anonymous vs Authenticated**:
   - Anonymous users: Can practice speaking and recording freely; can use Custom STT or manual text entry.
   - Managed STT: Prompts a gentle login guidance banner explaining that 10 minutes of daily speaking practice is provided upon sign-in.

---

## Administrator Console (`/admin/ai/` STT Tab)

Accessible only to verified administrators (`owner`, `admin`, `support`):
- **Metrics**: Today STT calls, total transcribed minutes, success rate %, active STT users, estimated API cost (USD), and quota blocks.
- **Trends**: 7-day volume and duration charts, 7-day estimated cost chart.
- **Failures & Top Users**: Recent errors (with error codes and models) and top users by speaking practice duration.
- **STT Operations Form**:
  - Global Kill Switch: `Managed STT ON / OFF`.
  - Model Selector: `gemini-3.5-transcribe`.
  - Daily Duration Limits: FREE (minutes) and future PRO (minutes). Label clearly states: "현재 표시 플랜: FREE".
  - Two-step confirmation dialog before any settings mutation.
- **STT Usage Logs**: Server-side filtered pagination (from, to, user UUID, status, plan, model).

---

## Owner Rollout Checklist

1. **Deploy Migration**:
   ```bash
   npx supabase db push --linked --dry-run
   npx supabase db push --linked
   ```
2. **Run SQL Tests**:
   Run `supabase/tests/managed_stt.sql` in the Supabase SQL Editor.
3. **Verify Secrets**:
   Ensure `GEMINI_API_KEY` is present in Edge Functions secrets.
4. **Deploy Edge Functions**:
   ```bash
   npx supabase functions deploy stt-api --project-ref "$env:OOM_SUPABASE_PROJECT_REF" --no-verify-jwt --use-api
   npx supabase functions deploy admin-api --project-ref "$env:OOM_SUPABASE_PROJECT_REF" --no-verify-jwt --use-api
   ```
5. **Initial State Verification**:
   - `stt_runtime_settings.managed_stt_enabled` is `false` by default.
   - Login to `/admin/ai/` $\rightarrow$ select "음성 인식 (STT)" tab $\rightarrow$ verify default settings (OFF, FREE 10분, PRO 60분).
6. **Activate STT in Admin Console**:
   - Check `Managed STT ON` $\rightarrow$ Confirm mutation $\rightarrow$ Verify audit row in `admin_audit_logs`.
7. **Perform End-to-End Verification**:
   - Record an answer in Quick Practice.
   - Click "음성을 텍스트로 변환" $\rightarrow$ verify verbatim transcript with "um", "uh" intact.
   - Edit transcript $\rightarrow$ verify label changes to "직접 수정됨".
   - Click "AI 피드백 받기" $\rightarrow$ verify feedback generates from edited text.
   - Check Admin STT usage table $\rightarrow$ verify request logged with exact duration, status `succeeded`, and no audio persisted.
