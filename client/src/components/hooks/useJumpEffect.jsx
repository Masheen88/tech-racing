import { useCallback, useState } from "react";

export const useJumpEffect = (jumpDuration, maxJumpScale) => {
  const [jumpEffect, setJumpEffect] = useState({
    scale: 1,
    shadowOpacity: 0.5,
  });

  const triggerJump = useCallback(() => {
    let startTime = performance.now();

    const animateJump = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / jumpDuration, 1);
      const scaleEffect = 1 + Math.sin(progress * Math.PI) * (maxJumpScale - 1);
      const shadowOpacity = 0.5 - Math.sin(progress * Math.PI) * 0.5;

      setJumpEffect({ scale: scaleEffect, shadowOpacity });

      if (progress < 1) {
        requestAnimationFrame(animateJump);
      } else {
        setJumpEffect({ scale: 1, shadowOpacity: 0.5 });
      }
    };

    requestAnimationFrame(animateJump);
  }, [jumpDuration, maxJumpScale]);

  return { jumpEffect, triggerJump };
};

export default useJumpEffect;
