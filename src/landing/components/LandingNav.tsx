import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { OomBrandMark } from "../../components/brand/OomBrandMark";

const links = [
  { href: "/about/", label: "오픽온미란?" },
  { href: "/training/", label: "훈련" },
  { href: "/exam-guide/", label: "수험 가이드" },
  { href: "/magazine/", label: "Magazine" },
];

export function LandingNav() {
  const [open, setOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const closeAndRestoreFocus = () => {
    setOpen(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  };

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        window.requestAnimationFrame(() => triggerRef.current?.focus());
        return;
      }
      if (event.key === "Tab" && menuRef.current) {
        const focusable = Array.from(menuRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'));
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first || !last) return;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    closeButtonRef.current?.focus();
    document.body.classList.add("landing-menu-open");
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("landing-menu-open");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <header className="landing-nav" data-landing-nav>
      <Link aria-label="오픽온미 홈" className="landing-logo" to="/">
        <OomBrandMark size="sm" variant="wordmark" />
      </Link>

      <nav aria-label="랜딩 주요 메뉴" className="landing-nav-links">
        {links.map((link) => (
          <Link key={link.href} to={link.href}>{link.label}</Link>
        ))}
        <Link className="landing-nav-cta" data-magnetic to="/training/">훈련 시작</Link>
      </nav>

      <button
        aria-controls="landing-mobile-menu"
        aria-expanded={open}
        aria-label="랜딩 메뉴 열기"
        className="landing-menu-trigger"
        onClick={() => setOpen(true)}
        ref={triggerRef}
        type="button"
      >
        <span />
        <span />
      </button>

      {open ? (
        <div aria-label="랜딩 모바일 메뉴" aria-modal="true" className="landing-mobile-menu" id="landing-mobile-menu" ref={menuRef} role="dialog">
          <div className="landing-mobile-menu-top">
            <span className="landing-logo"><OomBrandMark size="sm" variant="wordmark" /></span>
            <button aria-label="랜딩 메뉴 닫기" onClick={closeAndRestoreFocus} ref={closeButtonRef} type="button">닫기</button>
          </div>
          <nav aria-label="랜딩 모바일 주요 메뉴">
            {links.map((link, index) => (
              <Link key={link.href} onClick={() => setOpen(false)} to={link.href}>
                <span>{String(index + 1).padStart(2, "0")}</span>{link.label}
              </Link>
            ))}
          </nav>
          <Link className="landing-mobile-cta" onClick={() => setOpen(false)} to="/training/">실전 훈련 둘러보기</Link>
        </div>
      ) : null}
    </header>
  );
}
