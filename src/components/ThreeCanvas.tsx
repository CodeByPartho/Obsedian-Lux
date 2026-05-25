import { useEffect, useRef } from 'react';

interface ThreeCanvasProps {
  currentPage: string;
}

export default function ThreeCanvas({ currentPage }: ThreeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Watch for resize
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize center as 0,0
      mouseRef.current.targetX = e.clientX - width / 2;
      mouseRef.current.targetY = e.clientY - height / 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Particle structure
    interface Particle {
      x: number;
      y: number;
      z: number;
      ox: number; // original relative
      oy: number;
      oz: number;
      size: number;
      color: string;
      speed: number;
    }

    const particles: Particle[] = [];
    const particleCount = 200;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: (Math.random() - 0.5) * width * 1.5,
        y: (Math.random() - 0.5) * height * 1.5,
        z: Math.random() * 1000 + 100,
        ox: (Math.random() - 0.5) * width * 1.5,
        oy: (Math.random() - 0.5) * height * 1.5,
        oz: Math.random() * 1000 + 100,
        size: Math.random() * 1.5 + 0.5,
        color: i % 5 === 0 ? 'rgba(233, 69, 96, 0.4)' : 'rgba(255, 255, 255, 0.15)',
        speed: Math.random() * 0.5 + 0.1,
      });
    }

    // 3D wireframe points (Icosahedron vertices)
    const t = (1.0 + Math.sqrt(5.0)) / 2.0;
    let baseVertices = [
      [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
      [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
      [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]
    ];

    // Normalize vertices
    baseVertices = baseVertices.map(v => {
      const len = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
      return [v[0]/len, v[1]/len, v[2]/len];
    });

    // Connections (edges) based on proximity
    const vertexCount = baseVertices.length;
    const edges: [number, number][] = [];
    for (let i = 0; i < vertexCount; i++) {
      for (let j = i + 1; j < vertexCount; j++) {
        const dx = baseVertices[i][0] - baseVertices[j][0];
        const dy = baseVertices[i][1] - baseVertices[j][1];
        const dz = baseVertices[i][2] - baseVertices[j][2];
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        // Icosahedron edges are ~1.05 units pre-normalized, so < 1.1 matches them
        if (dist < 1.1) {
          edges.push([i, j]);
        }
      }
    }

    let angles = { x: 0, y: 0 };
    let rotationSpeed = { x: 0.003, y: 0.004 };
    let morphFactor = 1.0;
    let targetMorphFactor = 1.0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Interpolate mouse
      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // Dark futuristic overlay gradient matching deep theme
      const grad = ctx.createRadialGradient(
        width / 2 + mouse.x * 0.2,
        height / 2 + mouse.y * 0.2,
        10,
        width / 2,
        height / 2,
        Math.max(width, height)
      );
      grad.addColorStop(0, '#0F0F1A');
      grad.addColorStop(0.5, '#0A0A0F');
      grad.addColorStop(1, '#050508');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Render Floating Starfield with perspective
      const fov = 400; // Field of view
      particles.forEach(p => {
        // Drifting animation
        p.z -= p.speed * 2.5;
        if (p.z <= 0) {
          p.z = 1000;
        }

        // Project
        let px = (p.ox / p.z) * fov + width / 2;
        let py = (p.oy / p.z) * fov + height / 2;

        // Apply mouse distortion ripple
        const dx = px - (mouse.x + width / 2);
        const dy = py - (mouse.y + height / 2);
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
          const force = (200 - dist) * 0.15;
          px += (dx / dist) * force;
          py += (dy / dist) * force;
        }

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          const alpha = Math.max(0, Math.min(1, (1000 - p.z) / 1000)) * (p.color.includes('rgba(233') ? 0.7 : 0.35);
          ctx.beginPath();
          ctx.arc(px, py, p.size * (1.5 - p.z / 1000), 0, Math.PI * 2);
          ctx.fillStyle = p.color.includes('rgba(233') 
            ? `rgba(233, 69, 96, ${alpha})`
            : `rgba(235, 235, 255, ${alpha})`;
          ctx.fill();
        }
      });

      // Adjust morph structure according to current page
      // Home has full shape, shop has smaller floating, admin is a quiet sphere, etc.
      if (currentPage === 'home') targetMorphFactor = 1.0;
      else if (currentPage === 'shop') targetMorphFactor = 0.65;
      else if (currentPage === 'admin') targetMorphFactor = 0.4;
      else targetMorphFactor = 0.5;

      morphFactor += (targetMorphFactor - morphFactor) * 0.05;

      // Rotate shape
      angles.x += rotationSpeed.x + (mouse.y / (height * 30));
      angles.y += rotationSpeed.y + (mouse.x / (width * 30));

      const cx = Math.cos(angles.x);
      const sx = Math.sin(angles.x);
      const cy = Math.cos(angles.y);
      const sy = Math.sin(angles.y);

      // Map 3D coordinates & project
      const radius = Math.min(width, height) * 0.28 * morphFactor;
      const scaleZ = 250;

      const projectedVertices = baseVertices.map(v => {
        // Rotations
        // Pitch (X-axis)
        let x1 = v[0];
        let y1 = v[1] * cx - v[2] * sx;
        let z1 = v[1] * sx + v[2] * cx;

        // Yaw (Y-axis)
        let x2 = x1 * cy + z1 * sy;
        let y2 = y1;
        let z2 = -x1 * sy + z1 * cy;

        // Scale
        const scale = radius;
        const x3 = x2 * scale;
        const y3 = y2 * scale;
        const z3 = z2 * scale + scaleZ;

        // Projection
        const px = (x3 / z3) * 350 + width / 2 + mouse.x * 0.12;
        const py = (y3 / z3) * 350 + height / 2 + mouse.y * 0.12;

        return { x: px, y: py, z: z3 };
      });

      // Render outer glow representing --accent (#E94560)
      ctx.shadowBlur = 24;
      ctx.shadowColor = 'rgba(233, 69, 96, 0.4)';

      // Draw edges
      edges.forEach(([i, j]) => {
        const v1 = projectedVertices[i];
        const v2 = projectedVertices[j];

        // Fade based on average Z coordinate
        const avgZ = (v1.z + v2.z) / 2;
        const alpha = Math.max(0.1, Math.min(0.85, 1 - (avgZ - 100) / (radius * 2.5)));

        ctx.beginPath();
        ctx.moveTo(v1.x, v1.y);
        ctx.lineTo(v2.x, v2.y);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = `rgba(233, 69, 96, ${alpha})`;
        ctx.stroke();
      });

      // Draw Nodes (vertices)
      projectedVertices.forEach(v => {
        const alpha = Math.max(0.2, Math.min(1.0, 1 - (v.z - 100) / (radius * 2.5)));
        ctx.beginPath();
        ctx.arc(v.x, v.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#FFFFFF';
        ctx.fill();
      });

      // Reset shadows
      ctx.shadowBlur = 0;

      // Draw subtle auxiliary structural accent rings
      ctx.strokeStyle = 'rgba(15, 52, 96, 0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(width / 2 + mouse.x * 0.12, height / 2 + mouse.y * 0.12, radius * 1.3, 0, Math.PI * 2);
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [currentPage]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 block w-full h-full" />;
}
