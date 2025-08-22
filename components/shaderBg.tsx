"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { vertexShader, displayShader, fluidShader } from "@/app/lib/shders";

export function hexToRgb(hex: string): [number, number, number] {
  const r = Number.parseInt(hex.slice(1, 3), 16) / 255;
  const g = Number.parseInt(hex.slice(3, 5), 16) / 255;
  const b = Number.parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b];
}

const colors = [
  {
    color1: "#000000",
    color2: "#000000",
    color3: "#000000",
    color4: "#fafcfc",
  },
  {
    // puruple-ish
    color1: "#18122B",
    color2: "#443C68",
    color3: "#393053",
    color4: "#635985",
  },
  {
    //lighter
    color1: "#715A5A",
    color2: "#44444E",
    color3: "#37353E",
    color4: "#D3DAD9",
  },
  {
    // red-ish
    color1: "#A64D79",
    color2: "#3B1C32",
    color3: "#1A1A1D",
    color4: "#6A1E55",
  },
];

function lerpColor(color1: number[], color2: number[], t: number): number[] {
  return [
    color1[0] + (color2[0] - color1[0]) * t,
    color1[1] + (color2[1] - color1[1]) * t,
    color1[2] + (color2[2] - color1[2]) * t,
  ];
}

export default function ShaderBg({ index }: { index: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const [isMouseDistortionOn, setIsMouseDistortionOn] = useState(false);

  const displayMaterialRef = useRef<THREE.ShaderMaterial | null>(null);

  const currentColorsRef = useRef({
    color1: new THREE.Vector3(...hexToRgb(colors[0].color1)),
    color2: new THREE.Vector3(...hexToRgb(colors[0].color2)),
    color3: new THREE.Vector3(...hexToRgb(colors[0].color3)),
    color4: new THREE.Vector3(...hexToRgb(colors[0].color4)),
  });

  const targetColorsRef = useRef({
    color1: new THREE.Vector3(...hexToRgb(colors[0].color1)),
    color2: new THREE.Vector3(...hexToRgb(colors[0].color2)),
    color3: new THREE.Vector3(...hexToRgb(colors[0].color3)),
    color4: new THREE.Vector3(...hexToRgb(colors[0].color4)),
  });

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    canvasRef.current!.appendChild(renderer.domElement);

    const fluidTarget1 = new THREE.WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight,
      {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        type: THREE.FloatType,
      }
    );
    const fluidTarget2 = fluidTarget1.clone();

    let currentFluidTarget = fluidTarget1;
    let previousFluidTarget = fluidTarget2;
    let frameCount = 0;

    const fluidMaterial = new THREE.ShaderMaterial({
      uniforms: {
        iTime: { value: 0 },
        iResolution: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
        iMouse: { value: new THREE.Vector4(0, 0, 0, 0) },
        iFrame: { value: 0 },
        iPreviousFrame: { value: null },
      },
      vertexShader,
      fragmentShader: fluidShader,
    });

    const displayMaterial = new THREE.ShaderMaterial({
      uniforms: {
        iTime: { value: 0 },
        iResolution: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
        iFluid: { value: null },
        uDistortionAmount: { value: 2.5 },
        uColor1: {
          value: currentColorsRef.current.color1,
        },
        uColor2: {
          value: currentColorsRef.current.color2,
        },
        uColor3: {
          value: currentColorsRef.current.color3,
        },
        uColor4: {
          value: currentColorsRef.current.color4,
        },
        uColorIntensity: { value: 1.0 },
        uSoftness: { value: 1.0 },
      },
      vertexShader,
      fragmentShader: displayShader,
    });

    displayMaterialRef.current = displayMaterial;

    const geometry = new THREE.PlaneGeometry(2, 2);
    const fluidPlane = new THREE.Mesh(geometry, fluidMaterial);
    const displayPlane = new THREE.Mesh(geometry, displayMaterial);

    function animate() {
      requestAnimationFrame(animate);

      const time = performance.now() * 0.001;
      fluidMaterial.uniforms.iTime.value = time;
      displayMaterial.uniforms.iTime.value = time;
      fluidMaterial.uniforms.iFrame.value = frameCount;

      const lerpSpeed = 0.02;

      currentColorsRef.current.color1.lerp(
        targetColorsRef.current.color1,
        lerpSpeed
      );
      currentColorsRef.current.color2.lerp(
        targetColorsRef.current.color2,
        lerpSpeed
      );
      currentColorsRef.current.color3.lerp(
        targetColorsRef.current.color3,
        lerpSpeed
      );
      currentColorsRef.current.color4.lerp(
        targetColorsRef.current.color4,
        lerpSpeed
      );

      displayMaterial.uniforms.uColor1.value.copy(
        currentColorsRef.current.color1
      );
      displayMaterial.uniforms.uColor2.value.copy(
        currentColorsRef.current.color2
      );
      displayMaterial.uniforms.uColor3.value.copy(
        currentColorsRef.current.color3
      );
      displayMaterial.uniforms.uColor4.value.copy(
        currentColorsRef.current.color4
      );

      fluidMaterial.uniforms.iPreviousFrame.value = previousFluidTarget.texture;
      renderer.setRenderTarget(currentFluidTarget);
      renderer.render(fluidPlane, camera);

      displayMaterial.uniforms.iFluid.value = currentFluidTarget.texture;
      renderer.setRenderTarget(null);
      renderer.render(displayPlane, camera);

      const tmp = currentFluidTarget;
      currentFluidTarget = previousFluidTarget;
      previousFluidTarget = tmp;

      frameCount++;
    }

    animate();

    return () => {
      renderer.dispose();
      fluidTarget1.dispose();
      fluidTarget2.dispose();
    };
  }, []);

  useEffect(() => {
    if (!displayMaterialRef.current) return;

    const colorIndex = index % colors.length;

    targetColorsRef.current.color1.set(...hexToRgb(colors[colorIndex].color1));
    targetColorsRef.current.color2.set(...hexToRgb(colors[colorIndex].color2));
    targetColorsRef.current.color3.set(...hexToRgb(colors[colorIndex].color3));
    targetColorsRef.current.color4.set(...hexToRgb(colors[colorIndex].color4));
  }, [index]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full overflow-hidden bg-black z-0"
    >
      <div
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full ${
          isMouseDistortionOn ? "cursor-none" : "cursor-default"
        }`}
      />
    </div>
  );
}
