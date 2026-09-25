import React, { useRef, useEffect } from 'react';

interface ThreeCoinProps {
  className?: string;
  size?: number;
  interactive?: boolean;
}

export const ThreeCoin: React.FC<ThreeCoinProps> = ({
  className = '',
  size = 72,
  interactive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let angle = 0;
    let wobble = 0;
    let isHovered = false;
    let mousePos = { x: 0, y: 0 };

    const handleMouseEnter = () => {
      isHovered = true;
    };
    const handleMouseLeave = () => {
      isHovered = false;
    };
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mousePos.x = (e.clientX - rect.left) / rect.width - 0.5;
      mousePos.y = (e.clientY - rect.top) / rect.height - 0.5;
    };

    if (interactive) {
      canvas.addEventListener('mouseenter', handleMouseEnter);
      canvas.addEventListener('mouseleave', handleMouseLeave);
      canvas.addEventListener('mousemove', handleMouseMove);
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const radius = (w / 2) * 0.72;

      // Update rotation
      const spinSpeed = isHovered ? 0.06 : 0.025;
      angle += spinSpeed;
      wobble += 0.03;

      // 3D pseudo perspective
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      const tiltX = (interactive && isHovered ? mousePos.y * 0.4 : Math.sin(wobble) * 0.12);
      const tiltY = (interactive && isHovered ? mousePos.x * 0.4 : 0);

      ctx.save();
      ctx.translate(cx, cy);

      // Shadow underneath
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(0, radius * 0.95, radius * 0.75 * Math.abs(cosA) + 12, 10, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.filter = 'blur(6px)';
      ctx.fill();
      ctx.restore();

      // Coin thickness extrusion (draw back-to-front layers for 3D rim)
      const thickness = 14;
      const steps = 12;
      const dir = sinA > 0 ? 1 : -1;

      // Draw 3D coin edge
      for (let i = steps; i >= 0; i--) {
        const offset = (i / steps) * thickness * dir;
        const scaleX = cosA;
        ctx.save();
        ctx.translate(offset * Math.sin(tiltY), offset * 0.3);
        ctx.scale(scaleX, 1);
        ctx.rotate(tiltX);

        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        
        // Rim color gradient
        const rimGrad = ctx.createLinearGradient(-radius, -radius, radius, radius);
        rimGrad.addColorStop(0, '#b45309');
        rimGrad.addColorStop(0.3, '#f59e0b');
        rimGrad.addColorStop(0.6, '#d97706');
        rimGrad.addColorStop(1, '#78350f');
        ctx.fillStyle = rimGrad;
        ctx.fill();
        ctx.restore();
      }

      // Front / Back Face
      ctx.save();
      ctx.scale(cosA, 1);
      ctx.rotate(tiltX);

      // Gold coin face gradient
      const faceGrad = ctx.createRadialGradient(
        -radius * 0.25,
        -radius * 0.3,
        radius * 0.1,
        0,
        0,
        radius
      );
      if (cosA >= 0) {
        faceGrad.addColorStop(0, '#fef08a');
        faceGrad.addColorStop(0.2, '#facc15');
        faceGrad.addColorStop(0.6, '#eab308');
        faceGrad.addColorStop(0.95, '#b45309');
        faceGrad.addColorStop(1, '#78350f');
      } else {
        // Reverse side slightly darker shade
        faceGrad.addColorStop(0, '#fef9c3');
        faceGrad.addColorStop(0.25, '#fbbf24');
        faceGrad.addColorStop(0.7, '#d97706');
        faceGrad.addColorStop(1, '#78350f');
      }

      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fillStyle = faceGrad;
      ctx.fill();

      // Outer rim ring
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.88, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.6)';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Inner dashed beaded ring
      ctx.beginPath();
      ctx.setLineDash([3, 4]);
      ctx.arc(0, 0, radius * 0.78, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(120, 53, 15, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.setLineDash([]);

      // Engraved symbol (৳ for Taka)
      if (Math.abs(cosA) > 0.15) {
        ctx.save();
        ctx.font = `bold ${Math.floor(radius * 0.95)}px 'Plus Jakarta Sans', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Deep deboss shadow
        ctx.fillStyle = 'rgba(120, 53, 15, 0.75)';
        ctx.fillText('৳', 1.5, 2.5);

        // Bright specular highlight on text
        ctx.fillStyle = '#ffffff';
        ctx.fillText('৳', -0.5, -0.5);

        // Core text gold gradient
        const textGrad = ctx.createLinearGradient(0, -radius * 0.4, 0, radius * 0.4);
        textGrad.addColorStop(0, '#fffbeb');
        textGrad.addColorStop(0.5, '#fef08a');
        textGrad.addColorStop(1, '#ca8a04');
        ctx.fillStyle = textGrad;
        ctx.fillText('৳', 0, 0);
        ctx.restore();
      }

      // Specular sheen highlight across coin face
      const sheenGrad = ctx.createLinearGradient(-radius, -radius, radius, radius);
      sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0.55)');
      sheenGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.05)');
      sheenGrad.addColorStop(0.65, 'rgba(255, 255, 255, 0)');
      sheenGrad.addColorStop(1, 'rgba(255, 255, 255, 0.25)');

      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fillStyle = sheenGrad;
      ctx.fill();

      ctx.restore();
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (interactive) {
        canvas.removeEventListener('mouseenter', handleMouseEnter);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
        canvas.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [interactive]);

  return (
    <canvas
      ref={canvasRef}
      width={size * 2}
      height={size * 2}
      style={{ width: size, height: size }}
      className={`cursor-pointer transition-transform hover:scale-110 active:scale-95 ${className}`}
      title="3D TakaTrack Coin — Hover or click to interact"
    />
  );
};
