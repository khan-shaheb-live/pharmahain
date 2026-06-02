"use client";

import React, { useRef, useEffect } from "react";
import JsBarcode from "jsbarcode";

interface BarcodePreviewProps {
  value: string;
  width?: number;
  height?: number;
  displayValue?: boolean;
}

export function BarcodePreview({ 
  value, 
  width = 1.2, 
  height = 30, 
  displayValue = false 
}: BarcodePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      try {
        JsBarcode(canvasRef.current, value, {
          format: "CODE128",
          width: width,
          height: height,
          displayValue: displayValue,
          fontSize: 9,
          font: "monospace",
          background: "#ffffff",
          lineColor: "#000000",
          margin: 15
        });
      } catch (err) {
        console.error("Barcode preview generation failed", err);
      }
    }
  }, [value, width, height, displayValue]);

  return (
    <div className="inline-block bg-white p-1 rounded border border-slate-200 shadow-sm max-w-full overflow-hidden select-none">
      <canvas ref={canvasRef} className="max-h-[35px] max-w-full block" />
    </div>
  );
}
