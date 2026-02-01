"use client";

import { useEffect, useRef, useCallback } from "react";

interface Star {
  x: number;
  y: number;
  z: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}

interface Constellation {
  stars: { x: number; y: number }[];
  opacity: number;
}

export function SpaceBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const lightIntensityRef = useRef(0);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseRef.current = { x: e.clientX, y: e.clientY };
    lightIntensityRef.current = 1;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let stars: Star[] = [];
    let constellations: Constellation[] = [];
    const starCount = 180;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createStars = () => {
      stars = [];
      for (let i = 0; i < starCount * 0.6; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          z: Math.random() * 100 + 100,
          size: Math.random() * 0.8 + 0.2,
          opacity: Math.random() * 0.25 + 0.08,
          twinkleSpeed: Math.random() * 0.01 + 0.003,
          twinkleOffset: Math.random() * Math.PI * 2,
        });
      }
      for (let i = 0; i < starCount * 0.3; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          z: Math.random() * 50 + 50,
          size: Math.random() * 1.2 + 0.5,
          opacity: Math.random() * 0.4 + 0.15,
          twinkleSpeed: Math.random() * 0.02 + 0.008,
          twinkleOffset: Math.random() * Math.PI * 2,
        });
      }
      for (let i = 0; i < starCount * 0.1; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          z: Math.random() * 50,
          size: Math.random() * 1.8 + 0.8,
          opacity: Math.random() * 0.5 + 0.25,
          twinkleSpeed: Math.random() * 0.025 + 0.01,
          twinkleOffset: Math.random() * Math.PI * 2,
        });
      }
    };

    const createConstellations = () => {
      constellations = [];
      const constellationCount = 5;

      for (let c = 0; c < constellationCount; c++) {
        const baseX = Math.random() * canvas.width * 0.8 + canvas.width * 0.1;
        const baseY = Math.random() * canvas.height * 0.8 + canvas.height * 0.1;
        const starPoints: { x: number; y: number }[] = [];
        const pointCount = Math.floor(Math.random() * 4) + 3;

        for (let i = 0; i < pointCount; i++) {
          starPoints.push({
            x: baseX + (Math.random() - 0.5) * 150,
            y: baseY + (Math.random() - 0.5) * 120,
          });
        }

        constellations.push({
          stars: starPoints,
          opacity: Math.random() * 0.15 + 0.08,
        });
      }
    };

    const animate = () => {
      const time = Date.now();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      lightIntensityRef.current *= 0.96;

      const mouse = mouseRef.current;

      const nebulaTime = time * 0.00008;

      const nebula1X = canvas.width * 0.25 + Math.sin(nebulaTime) * 60;
      const nebula1Y = canvas.height * 0.35 + Math.cos(nebulaTime * 0.7) * 40;
      const gradient1 = ctx.createRadialGradient(nebula1X, nebula1Y, 0, nebula1X, nebula1Y, 400);
      gradient1.addColorStop(0, "rgba(255, 255, 255, 0.025)");
      gradient1.addColorStop(0.3, "rgba(220, 220, 220, 0.015)");
      gradient1.addColorStop(0.6, "rgba(180, 180, 180, 0.008)");
      gradient1.addColorStop(1, "rgba(150, 150, 150, 0)");
      ctx.beginPath();
      ctx.arc(nebula1X, nebula1Y, 400, 0, Math.PI * 2);
      ctx.fillStyle = gradient1;
      ctx.fill();

      const nebula2X = canvas.width * 0.75 + Math.cos(nebulaTime * 0.8) * 50;
      const nebula2Y = canvas.height * 0.65 + Math.sin(nebulaTime * 0.6) * 45;
      const gradient2 = ctx.createRadialGradient(nebula2X, nebula2Y, 0, nebula2X, nebula2Y, 350);
      gradient2.addColorStop(0, "rgba(255, 255, 255, 0.02)");
      gradient2.addColorStop(0.4, "rgba(200, 200, 200, 0.012)");
      gradient2.addColorStop(1, "rgba(150, 150, 150, 0)");
      ctx.beginPath();
      ctx.arc(nebula2X, nebula2Y, 350, 0, Math.PI * 2);
      ctx.fillStyle = gradient2;
      ctx.fill();

      const nebula3X = canvas.width * 0.5 + Math.sin(nebulaTime * 1.2) * 40;
      const nebula3Y = canvas.height * 0.2 + Math.cos(nebulaTime * 0.9) * 30;
      const gradient3 = ctx.createRadialGradient(nebula3X, nebula3Y, 0, nebula3X, nebula3Y, 200);
      gradient3.addColorStop(0, "rgba(255, 255, 255, 0.018)");
      gradient3.addColorStop(0.5, "rgba(200, 200, 200, 0.008)");
      gradient3.addColorStop(1, "rgba(150, 150, 150, 0)");
      ctx.beginPath();
      ctx.arc(nebula3X, nebula3Y, 200, 0, Math.PI * 2);
      ctx.fillStyle = gradient3;
      ctx.fill();

      constellations.forEach((constellation) => {
        ctx.strokeStyle = `rgba(255, 255, 255, ${constellation.opacity * 0.4})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();

        for (let i = 0; i < constellation.stars.length - 1; i++) {
          ctx.moveTo(constellation.stars[i].x, constellation.stars[i].y);
          ctx.lineTo(constellation.stars[i + 1].x, constellation.stars[i + 1].y);
        }
        ctx.stroke();

        constellation.stars.forEach((point) => {
          const twinkle = Math.sin(time * 0.002 + point.x) * 0.3 + 0.7;
          ctx.beginPath();
          ctx.arc(point.x, point.y, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${constellation.opacity * twinkle * 1.5})`;
          ctx.fill();
        });
      });

      stars.forEach((star) => {
        star.x += Math.sin(time * 0.00008 + star.twinkleOffset) * 0.015;
        star.y += Math.cos(time * 0.00008 + star.twinkleOffset) * 0.015;

        if (star.x < 0) star.x = canvas.width;
        if (star.x > canvas.width) star.x = 0;
        if (star.y < 0) star.y = canvas.height;
        if (star.y > canvas.height) star.y = 0;

        const scale = (200 - star.z) / 200;
        const size = star.size * scale;

        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.5 + 0.5;
        let currentOpacity = star.opacity * scale * (0.5 + twinkle * 0.5);

        const dx = mouse.x - star.x;
        const dy = mouse.y - star.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200 && lightIntensityRef.current > 0.05) {
          const boost = (1 - dist / 200) * 0.25 * lightIntensityRef.current;
          currentOpacity += boost;
        }

        const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, size * 5);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${Math.min(currentOpacity * 1.2, 1)})`);
        gradient.addColorStop(0.2, `rgba(255, 255, 255, ${currentOpacity * 0.6})`);
        gradient.addColorStop(0.5, `rgba(255, 255, 255, ${currentOpacity * 0.2})`);
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

        ctx.beginPath();
        ctx.arc(star.x, star.y, size * 5, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(star.x, star.y, size * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(currentOpacity * 2, 1)})`;
        ctx.fill();
      });

      if (lightIntensityRef.current > 0.01) {
        const lightGradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 250);
        lightGradient.addColorStop(0, `rgba(255, 255, 255, ${0.03 * lightIntensityRef.current})`);
        lightGradient.addColorStop(0.5, `rgba(255, 255, 255, ${0.015 * lightIntensityRef.current})`);
        lightGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 250, 0, Math.PI * 2);
        ctx.fillStyle = lightGradient;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    resize();
    createStars();
    createConstellations();
    animate();

    const handleResize = () => {
      resize();
      createStars();
      createConstellations();
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [handleMouseMove]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ background: "transparent" }}
    />
  );
}
