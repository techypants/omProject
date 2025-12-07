"use client";

import { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function QRcodeComponent() {
    const [qrValue, setQrValue] = useState("https://mathsmaster.vercel.app/");

    // useEffect(() => {
    //     if (typeof window !== "undefined") {
    //         setQrValue(window.location.href);
    //     }
    // }, []);

  

    return (
        <Card className="w-full mx-auto ">
            <CardHeader>
                <CardTitle>Scan the QR code to try Maths Master on your devices</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
                {qrValue && (
                    <QRCode
                        id="qrcode"
                        value={qrValue}
                        size={200}
                        level={"H"}
                        className="border p-2 rounded-lg shadow-lg"
                    />
                )}
                <p className="text-sm text-gray-500 break-all">{qrValue}</p>
                {/* <Button onClick={downloadQRCode}>Download QR Code</Button> */}
            </CardContent>
        </Card>
    );
}