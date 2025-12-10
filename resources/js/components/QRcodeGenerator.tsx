"use client";
import React, { useEffect, useRef } from "react";
import QRCodeStyling from "qr-code-styling";
import { Button } from "@/components/ui/button";

interface QRCodeWithLogoProps {
  url: string;
  width?: number;
  height?: number;
  logo?: string;
  logoWidth?: number;
  logoHeight?: number;
}

const QRCodeWithLogo: React.FC<QRCodeWithLogoProps> = ({
  url,
  width = 200,
  height = 200,
  logo,
  logoWidth = 50,
  logoHeight = 50,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const qrCodeRef = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const qrCode = new QRCodeStyling({
      width,
      height,
      data: url,
      image: "logo.png",
      dotsOptions: { color: "#000", type: "rounded" },
      backgroundOptions: { color: "#fff" },
      imageOptions: { crossOrigin: "anonymous", width: logoWidth, height: logoHeight, margin: 5 },
    });

    qrCode.append(ref.current);
    qrCodeRef.current = qrCode;

    return () => {
      if (ref.current) ref.current.innerHTML = "";
    };
  }, [url, width, height, logo, logoWidth, logoHeight]);

  const downloadQRCode = () => {
    if (qrCodeRef.current) {
      qrCodeRef.current.getRawData("png").then((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "qr-code.png";
        link.click();
        URL.revokeObjectURL(url);
      });
    }
  };

  return (
    <div>
      <div ref={ref} />
      <Button
        onClick={downloadQRCode}

      >
        Pobierz QR
      </Button>
    </div>
  );
};

export default QRCodeWithLogo;
