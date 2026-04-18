"use client";

interface AnimatedTextProps {
  text: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  className?: string;
  animation?:
    | "word-stagger"
    | "blur-reveal"
    | "elastic"
    | "3d-tilt"
    | "expand"
    | "fade-slide"
    | "scale-reveal"
    | "split-reveal"
    | "light-sweep"
    | "light-sweep-slow"
    | "gradient-mono";
  delay?: number;
  children?: React.ReactNode;
}

export function AnimatedText({
  text,
  as: Component = "p",
  className = "",
  animation = "fade-slide",
  delay = 0,
  children,
}: AnimatedTextProps) {
  // Word-by-word stagger requires splitting
  if (animation === "word-stagger") {
    const words = text.split(" ");
    return (
      <Component className={`text-word-stagger text-3d-perspective ${className}`}>
        {words.map((word, i) => (
          <span key={i} className="word" style={{ animationDelay: `${i * 100 + delay}ms` }}>
            {word}
            {i < words.length - 1 ? "\u00A0" : ""}
          </span>
        ))}
        {children}
      </Component>
    );
  }

  // Split reveal requires wrapping
  if (animation === "split-reveal") {
    return (
      <Component className={`text-split-reveal ${className}`} style={{ animationDelay: `${delay}ms` }}>
        <span>{text}</span>
        {children}
      </Component>
    );
  }

  // Special effect animations (always active)
  const isSpecialEffect =
    animation === "light-sweep" ||
    animation === "light-sweep-slow" ||
    animation === "gradient-mono";

  if (isSpecialEffect) {
    const specialClass =
      animation === "light-sweep"
        ? "text-light-sweep"
        : animation === "light-sweep-slow"
          ? "text-light-sweep-slow"
          : "text-gradient-mono";

    return (
      <Component className={`${specialClass} ${className}`}>
        {text}
        {children}
      </Component>
    );
  }

  // Standard animations with class mapping
  const animationClass = {
    "blur-reveal": "text-blur-reveal",
    elastic: "text-elastic",
    "3d-tilt": "text-3d-tilt text-3d-perspective",
    expand: "text-expand",
    "fade-slide": "text-fade-slide",
    "scale-reveal": "text-scale-reveal",
  }[animation as string];

  return (
    <Component
      className={`${animationClass} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {text}
      {children}
    </Component>
  );
}

// Utility component for underlined text
export function AnimatedUnderlineText({
  text,
  className = "",
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  return (
    <span className={`text-underline-reveal ${className}`}>
      {text}
    </span>
  );
}

// Glitch text component (hover effect)
export function GlitchText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  return (
    <span className={`text-glitch-accent ${className}`} data-text={text}>
      {text}
    </span>
  );
}
