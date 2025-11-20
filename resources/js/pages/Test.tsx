import React, { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import QRCodeStyling from "qr-code-styling";

// Usage:
// <QrWithLogo text="https://twoj-link.pl" logo="/logo.png" />

export default function QrWithLogo({ text ="https://filecloud.ct8.pl/share/65", logo="http://localhost:8000/logo.png" }) {
  const ref = useRef(null);
  const qr = useRef(null);

  useEffect(() => {
    qr.current = new QRCodeStyling({
      width: 300,
      height: 300,
      type: "svg",
      data: text,
      image: logo,
      dotsOptions: {
        type: "rounded"
      },
      cornersSquareOptions: {
        type: "extra-rounded"
      },
      imageOptions: {
        crossOrigin: "anonymous",

        margin: 8
      }
    });
    qr.current.append(ref.current);
  }, []);

  useEffect(() => {
    if (qr.current) {
      qr.current.update({ data: text, image: logo });
    }
  }, [text, logo]);

  const download = () => {
    qr.current.download({ name: "qr-code", extension: "png" });
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <Card className="p-4 shadow-xl rounded-2xl">
        <CardContent>
          <div ref={ref} />
        </CardContent>
      </Card>
      <Button onClick={download} className="px-6 py-2 rounded-2xl shadow">
        Pobierz QR
      </Button>
    </div>
  );
}
