import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PracticeReviewPanel, type PracticeReviewPanelProps } from './PracticeReviewPanel';
const props: PracticeReviewPanelProps = { answer: 'I visited a park.', autoTranscribe: false, feedback: '', isFeedbackLoading: false, onAnswerChange: vi.fn(), onFeedback: vi.fn(), onRetryAttempt: vi.fn(), onTranscribe: vi.fn(), hasRecording: false, sttStatus: 'unconfigured' };
describe('one selected feedback path', () => {
  it('managed replaces custom even when custom is configured', () => {
    render(<PracticeReviewPanel {...props} customConfigured managedFeedback={<button>AI 피드백 받기</button>} />);
    expect(screen.getAllByRole('button', { name: 'AI 피드백 받기' })).toHaveLength(1);
    expect(screen.queryByRole('button', { name: '사용자 지정 LLM으로 분석' })).not.toBeInTheDocument();
  });
  it('custom renders only its own action', () => {
    render(<PracticeReviewPanel {...props} customConfigured />);
    expect(screen.getByRole('button', { name: '사용자 지정 LLM으로 분석' })).toBeEnabled();
    expect(screen.queryByRole('button', { name: 'AI 피드백 받기' })).not.toBeInTheDocument();
  });
  it('missing custom config shows settings instead of an AI action', () => {
    render(<PracticeReviewPanel {...props} customConfigured={false} />);
    expect(screen.getByRole('button', { name: 'AI 설정 열기' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '사용자 지정 LLM으로 분석' })).not.toBeInTheDocument();
  });
});
