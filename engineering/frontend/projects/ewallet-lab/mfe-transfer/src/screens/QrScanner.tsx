import { Icon } from '@ewallet-lab/ui';
import { useEffect, useRef, useState } from 'react';

/**
 * Camera-based QR scanner using the browser `BarcodeDetector` API (Chrome/Edge/Android WebView),
 * with a documented fallback for browsers that don't implement it (notably Firefox and Safari as
 * of writing) — see issue #4 Constraints. No `jsQR`-style JS decoder fallback is added: keeping
 * this to a native-API-or-manual-entry choice avoids pulling in a second QR dependency for a
 * feature that's already optional (manual phone entry always works).
 *
 * Camera access requires a "secure context" (HTTPS or `localhost`) in all major browsers — see
 * frontend DESIGN.md "QR payload format & camera limitation" for how this was verified given the
 * lab's `*.ewallet-lab.local` Ingress is plain HTTP.
 */
type BarcodeDetectorResult = { rawValue: string };
interface BarcodeDetectorLike {
  detect(source: CanvasImageSource): Promise<BarcodeDetectorResult[]>;
}
declare global {
  interface Window {
    BarcodeDetector?: new (options?: { formats: string[] }) => BarcodeDetectorLike;
  }
}

export function isQrScanSupported(): boolean {
  return typeof window !== 'undefined' && 'BarcodeDetector' in window && !!navigator.mediaDevices?.getUserMedia;
}

export function QrScanner({ onDetected, onClose }: { onDetected: (rawValue: string) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraError, setCameraError] = useState<string | undefined>();

  useEffect(() => {
    if (!isQrScanSupported()) return;
    let stream: MediaStream | undefined;
    let raf = 0;
    let stopped = false;
    const detector = new window.BarcodeDetector!({ formats: ['qr_code'] });

    async function loop() {
      if (stopped || !videoRef.current || videoRef.current.readyState < 2) {
        raf = requestAnimationFrame(loop);
        return;
      }
      try {
        const codes = await detector.detect(videoRef.current);
        if (codes.length > 0) {
          onDetected(codes[0].rawValue);
          return;
        }
      } catch {
        // transient mid-frame decode failure — expected, just retry next frame
      }
      raf = requestAnimationFrame(loop);
    }

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (stopped) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        raf = requestAnimationFrame(loop);
      } catch {
        setCameraError('Không truy cập được camera — kiểm tra quyền trình duyệt đã cấp cho trang này chưa.');
      }
    })();

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#000',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: 12 }}>
        <button
          onClick={onClose}
          aria-label="Đóng"
          style={{ background: 'rgba(255,255,255,0.15)', border: 0, borderRadius: '50%', width: 36, height: 36, cursor: 'pointer' }}
        >
          <Icon name="close" style={{ color: '#fff' }} />
        </button>
      </div>

      {!isQrScanSupported() ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <p style={{ color: '#fff', fontSize: 13.5, textAlign: 'center', maxWidth: 280 }}>
            Trình duyệt này chưa hỗ trợ quét QR trực tiếp (cần <code>BarcodeDetector</code> API — có trên
            Chrome/Edge, chưa có trên Firefox/Safari tại thời điểm viết). Vui lòng nhập số điện thoại thủ công.
          </p>
        </div>
      ) : cameraError ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <p style={{ color: '#fff', fontSize: 13.5, textAlign: 'center', maxWidth: 280 }}>{cameraError}</p>
        </div>
      ) : (
        <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <video ref={videoRef} muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div
            style={{
              position: 'absolute',
              width: 220,
              height: 220,
              border: '2px solid #fff',
              borderRadius: 16,
              boxShadow: '0 0 0 2000px rgba(0,0,0,0.35)',
            }}
          />
          <p style={{ position: 'absolute', bottom: 32, color: '#fff', fontSize: 13, textAlign: 'center' }}>
            Đưa mã QR của Ewallet Lab vào khung hình
          </p>
        </div>
      )}
    </div>
  );
}
