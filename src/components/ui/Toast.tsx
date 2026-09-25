
import { CheckCircle2, CircleAlert, Info, X } from "lucide-react";
import type { ToastMessage } from "../../types";
import { Button } from "./Button";

type ToastProps = {
  toast: ToastMessage | null;
  onDismiss: () => void;
};

export function Toast({ toast, onDismiss }: ToastProps) {
  const Icon = toast?.tone === "error" ? CircleAlert : toast?.tone === "success" ? CheckCircle2 : Info;
  const color = toast?.tone === "error" ? "text-rose-500" : toast?.tone === "success" ? "text-emerald-500" : "text-indigo-500";

  return (
    <>
      {toast ? (
        <div
          className="oom-enter fixed bottom-5 right-5 z-50 flex w-[min(360px,calc(100vw-2.5rem))] items-start gap-3 rounded-md border border-zinc-200 bg-white p-4 shadow-soft dark:border-zinc-700 dark:bg-zinc-900"
          role="status"
        >
          <Icon aria-hidden="true" className={`mt-0.5 h-5 w-5 ${color}`} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">{toast.title}</p>
            {toast.description ? <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">{toast.description}</p> : null}
          </div>
          <Button aria-label="알림 닫기" onClick={onDismiss} size="icon" variant="ghost">
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : null}
    </>
  );
}
