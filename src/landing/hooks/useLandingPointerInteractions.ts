import { type RefObject, useEffect } from "react";

type Cleanup = () => void;

export function useLandingPointerInteractions(rootRef: RefObject<HTMLDivElement | null>, enabled: boolean) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !enabled) return;
    const cleanups: Cleanup[] = [];

    root.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((element) => {
      const onMove = (event: PointerEvent) => {
        if (element.matches(":focus-visible")) return;
        const rect = element.getBoundingClientRect();
        const x = event.clientX - (rect.left + rect.width / 2);
        const y = event.clientY - (rect.top + rect.height / 2);
        element.style.transform = `translate3d(${x * 0.11}px, ${y * 0.11}px, 0)`;
      };
      const reset = () => { element.style.transform = ""; };
      element.addEventListener("pointermove", onMove);
      element.addEventListener("pointerleave", reset);
      element.addEventListener("blur", reset);
      cleanups.push(() => {
        element.removeEventListener("pointermove", onMove);
        element.removeEventListener("pointerleave", reset);
        element.removeEventListener("blur", reset);
        reset();
      });
    });

    const examConsole = root.querySelector<HTMLElement>(".landing-exam-console");
    if (examConsole) {
      const onMove = (event: PointerEvent) => {
        const rect = examConsole.getBoundingClientRect();
        const x = (event.clientX - rect.left) / Math.max(1, rect.width) - 0.5;
        const y = (event.clientY - rect.top) / Math.max(1, rect.height) - 0.5;
        examConsole.style.setProperty("--console-tilt-x", `${y * -2.5}deg`);
        examConsole.style.setProperty("--console-tilt-y", `${x * 3.5}deg`);
      };
      const reset = () => {
        examConsole.style.setProperty("--console-tilt-x", "0deg");
        examConsole.style.setProperty("--console-tilt-y", "0deg");
      };
      examConsole.addEventListener("pointermove", onMove);
      examConsole.addEventListener("pointerleave", reset);
      cleanups.push(() => {
        examConsole.removeEventListener("pointermove", onMove);
        examConsole.removeEventListener("pointerleave", reset);
        reset();
      });
    }

    const stepList = root.querySelector<HTMLElement>(".landing-step-list");
    if (stepList) {
      const stepItems = Array.from(stepList.querySelectorAll<HTMLElement>("li"));
      const clear = () => stepItems.forEach((item) => item.classList.remove("is-pointer-active"));
      const onMove = (event: PointerEvent) => {
        stepItems.forEach((item) => {
          const rect = item.getBoundingClientRect();
          const distance = Math.hypot(event.clientX - rect.left, event.clientY - rect.top);
          item.classList.toggle("is-pointer-active", distance < 125);
        });
      };
      stepList.addEventListener("pointermove", onMove);
      stepList.addEventListener("pointerleave", clear);
      cleanups.push(() => {
        stepList.removeEventListener("pointermove", onMove);
        stepList.removeEventListener("pointerleave", clear);
        clear();
      });
    }

    return () => cleanups.forEach((cleanup) => cleanup());
  }, [enabled, rootRef]);
}
