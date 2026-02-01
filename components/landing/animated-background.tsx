"use client";

import { useEffect, useRef, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}

interface FluidBlob {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  phase: number;
  phaseSpeed: number;
}

export function AnimatedBackground() {
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
    let particles: Particle[] = [];
    let fluidBlobs: FluidBlob[] = [];
    const particleCount = 80;
    const connectionDistance = 120;
    const mouseRadius = 150;
    const blobCount = 5;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          z: Math.random() * 300,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          vz: (Math.random() - 0.5) * 0.1,
          size: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.4 + 0.1,
          twinkleSpeed: Math.random() * 0.02 + 0.01,
          twinkleOffset: Math.random() * Math.PI * 2,
        });
      }
    };

    const createFluidBlobs = () => {
      fluidBlobs = [];
      for (let i = 0; i < blobCount; i++) {
        fluidBlobs.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 200 + 100,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          phase: Math.random() * Math.PI * 2,
          phaseSpeed: Math.random() * 0.005 + 0.002,
        });
      }
    };

    const drawFluidBlobs = (time: number) => {
      fluidBlobs.forEach((blob) => {
        blob.x += blob.vx;
        blob.y += blob.vy;
        blob.phase += blob.phaseSpeed;

        if (blob.x < -blob.radius) blob.x = canvas.width + blob.radius;
        if (blob.x > canvas.width + blob.radius) blob.x = -blob.radius;
        if (blob.y < -blob.radius) blob.y = canvas.height + blob.radius;
        if (blob.y > canvas.height + blob.radius) blob.y = -blob.radius;

        const dynamicRadius = blob.radius + Math.sin(blob.phase) * 30;

        const gradient = ctx.createRadialGradient(
          blob.x,
          blob.y,
          0,
          blob.x,
          blob.y,
          dynamicRadius
        );

        const baseOpacity = 0.015 + Math.sin(time * 0.0003 + blob.phase) * 0.005;
        gradient.addColorStop(0, `rgba(255, 255, 255, ${baseOpacity})`);
        gradient.addColorStop(0.5, `rgba(200, 200, 200, ${baseOpacity * 0.5})`);
        gradient.addColorStop(1, "rgba(150, 150, 150, 0)");

        ctx.beginPath();
        ctx.arc(blob.x, blob.y, dynamicRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });
    };

    const drawHexagon = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      radius: number,
      rotation: number,
      baseOpacity: number,
      mouse: { x: number; y: number }
    ) => {
      const dist = Math.sqrt((mouse.x - x) ** 2 + (mouse.y - y) ** 2);
      const highlight = dist < 200 ? (1 - dist / 200) * 0.03 : 0;
      const opacity = baseOpacity + highlight;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const px = Math.cos(angle) * radius;
        const py = Math.sin(angle) * radius;
        if (i === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
      ctx.restore();
    };

    const drawRing = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      radius: number,
      rotation: number,
      baseOpacity: number,
      mouse: { x: number; y: number }
    ) => {
      const dist = Math.sqrt((mouse.x - x) ** 2 + (mouse.y - y) ** 2);
      const highlight = dist < 200 ? (1 - dist / 200) * 0.03 : 0;
      const opacity = baseOpacity + highlight;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);

      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.6, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.5})`;
      ctx.stroke();

      for (let i = 0; i < 4; i++) {
        const angle = (Math.PI / 2) * i + rotation;
        const dx = Math.cos(angle) * radius;
        const dy = Math.sin(angle) * radius;

        const dotGradient = ctx.createRadialGradient(dx, dy, 0, dx, dy, 4);
        dotGradient.addColorStop(0, `rgba(255, 255, 255, ${opacity * 1.5})`);
        dotGradient.addColorStop(1, "rgba(255, 255, 255, 0)");

        ctx.beginPath();
        ctx.arc(dx, dy, 4, 0, Math.PI * 2);
        ctx.fillStyle = dotGradient;
        ctx.fill();
      }

      ctx.restore();
    };

    const animate = () => {
      const time = Date.now();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      lightIntensityRef.current *= 0.95;

      drawFluidBlobs(time);

      const mouse = mouseRef.current;
      if (lightIntensityRef.current > 0.01) {
        const lightGradient = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          250
        );
        lightGradient.addColorStop(0, `rgba(255, 255, 255, ${0.03 * lightIntensityRef.current})`);
        lightGradient.addColorStop(0.5, `rgba(255, 255, 255, ${0.015 * lightIntensityRef.current})`);
        lightGradient.addColorStop(1, "rgba(255, 255, 255, 0)");

        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 250, 0, Math.PI * 2);
        ctx.fillStyle = lightGradient;
        ctx.fill();
      }

      particles.forEach((particle, i) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.z += particle.vz;

        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
        if (particle.z < 0) particle.z = 300;
        if (particle.z > 300) particle.z = 0;

        const scale = (300 - particle.z) / 300;
        const size = particle.size * scale;

        const twinkle = Math.sin(time * particle.twinkleSpeed + particle.twinkleOffset) * 0.5 + 0.5;
        const currentOpacity = particle.opacity * scale * (0.5 + twinkle * 0.5);

        const dx = mouse.x - particle.x;
        const dy = mouse.y - particle.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouseRadius && dist > 0) {
          const force = (mouseRadius - dist) / mouseRadius;
          particle.vx -= (dx / dist) * force * 0.008;
          particle.vy -= (dy / dist) * force * 0.008;
        }

        particle.vx *= 0.995;
        particle.vy *= 0.995;

        const maxVel = 0.3;
        particle.vx = Math.max(-maxVel, Math.min(maxVel, particle.vx));
        particle.vy = Math.max(-maxVel, Math.min(maxVel, particle.vy));

        const gradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          size * 3
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${currentOpacity})`);
        gradient.addColorStop(0.4, `rgba(255, 255, 255, ${currentOpacity * 0.4})`);
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, size * 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const other = particles[j];
          const cdx = particle.x - other.x;
          const cdy = particle.y - other.y;
          const distance = Math.sqrt(cdx * cdx + cdy * cdy);

          if (distance < connectionDistance) {
            const connectionOpacity = (1 - distance / connectionDistance) * 0.06 * scale;

            const midX = (particle.x + other.x) / 2;
            const midY = (particle.y + other.y) / 2;
            const mouseDistToLine = Math.sqrt((mouse.x - midX) ** 2 + (mouse.y - midY) ** 2);
            const highlight = mouseDistToLine < 100 ? (1 - mouseDistToLine / 100) * 0.05 : 0;

            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${connectionOpacity + highlight})`;
            ctx.lineWidth = 0.3;
            ctx.stroke();
          }
        }
      });

      const shapeTime = time * 0.0003;

      drawHexagon(
        ctx,
        canvas.width * 0.15 + Math.sin(shapeTime) * 40,
        canvas.height * 0.25 + Math.cos(shapeTime * 0.7) * 30,
        60,
        shapeTime * 0.3,
        0.02,
        mouse
      );

      drawHexagon(
        ctx,
        canvas.width * 0.85 + Math.cos(shapeTime * 0.8) * 35,
        canvas.height * 0.65 + Math.sin(shapeTime * 0.6) * 40,
        45,
        -shapeTime * 0.2,
        0.015,
        mouse
      );

      drawRing(
        ctx,
        canvas.width * 0.75 + Math.sin(shapeTime * 0.5) * 25,
        canvas.height * 0.2 + Math.cos(shapeTime * 0.8) * 20,
        50,
        shapeTime * 0.5,
        0.02,
        mouse
      );

      drawRing(
        ctx,
        canvas.width * 0.1 + Math.cos(shapeTime * 0.7) * 20,
        canvas.height * 0.8 + Math.sin(shapeTime * 0.4) * 30,
        35,
        -shapeTime * 0.4,
        0.015,
        mouse
      );

      animationFrameId = requestAnimationFrame(animate);
    };

    resize();
    createParticles();
    createFluidBlobs();
    animate();

    const handleResize = () => {
      resize();
      createParticles();
      createFluidBlobs();
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
