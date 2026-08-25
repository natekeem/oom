# TEST_CASES.md

Suggested regression tests:

1. `viewPathForId["exam-screen"] === "/exam-guide/screen/"`
2. `viewIdForPath("/exam-guide/screen/") === "exam-screen"`
3. Exam guide sections contain `exam-screen`.
4. Guide page contains timer disclaimer.
5. Training hub contains `추천 서베이 익히기`.
6. Survey screen contains `추천 서베이 익히기`.
7. New question starts with listen count 0.
8. Listen action increments to 1 then 2.
9. Third listen does not invoke TTS.
10. Same-question retry resets listen count to 0.
11. STT endpoint empty → unconfigured UI.
12. STT endpoint set + auto off → manual transcribe button.
13. Manual transcribe calls existing adapter with current RecordingResult.
14. Successful transcription populates editable textarea.
15. Failed transcription renders persistent error and retry.
16. Retry transcription does not discard recording.
17. Recording state exposes visible `녹음 중`.
18. Review tools do not compete visually during active recording.
19. Existing `attemptIdRef` stale response test remains.
20. Existing recorder reset discard behavior remains.
