import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Smoothly reveals direct children (or [data-reveal] descendants) on scroll.
 * Use on a section wrapper.
 */
export function useScrollReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!ref.current || typeof window === "undefined") return;
    const ctx = gsap.context(() => {
      const targets = ref.current!.querySelectorAll<HTMLElement>("[data-reveal]");
      const items = targets.length ? targets : (Array.from(ref.current!.children) as HTMLElement[]);

      gsap.fromTo(
        items,
        { y: 40, opacity: 0, filter: "blur(6px)" },
        {
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 1.1,
          ease: "power3.out",
          stagger: 0.09,
          scrollTrigger: {
            trigger: ref.current,
            start: "top 82%",
            toggleActions: "play none none reverse",
          },
        },
      );
    }, ref);

    return () => ctx.revert();
  }, []);

  return ref;
}
