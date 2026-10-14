import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, Check } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File, previewUrl: string) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setCapturedPreview(null);
      setErrorMsg(null);
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setErrorMsg(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 960 } }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setErrorMsg('Could not access device camera. Please check camera permissions or upload an image file instead.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleSnap = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedPreview(dataUrl);
      }
    }
  };

  const handleRetake = () => {
    setCapturedPreview(null);
  };

  const handleConfirm = () => {
    if (!capturedPreview) return;
    // Convert base64 to File object
    const arr = capturedPreview.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const file = new File([u8arr], `grain_capture_${Date.now()}.jpg`, { type: mime });
    onCapture(file, capturedPreview);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50">
          <div className="flex items-center gap-2 text-agri-900 font-semibold">
            <Camera className="w-5 h-5 text-agri-600" />
            <span>Capture Grain Sample Live</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-500 hover:text-stone-700 hover:bg-stone-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport */}
        <div className="relative bg-black aspect-4/3 flex items-center justify-center overflow-hidden">
          {errorMsg ? (
            <div className="p-6 text-center text-red-200 text-sm">
              <p className="font-semibold text-white mb-2">Camera Unavailable</p>
              <p>{errorMsg}</p>
            </div>
          ) : capturedPreview ? (
            <img src={capturedPreview} alt="Captured Grain" className="w-full h-full object-contain" />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Guidance overlay box */}
              <div className="absolute inset-8 border-2 border-dashed border-emerald-400/80 rounded-xl pointer-events-none flex items-center justify-center">
                <span className="bg-black/60 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                  Align grains flat within this frame
                </span>
              </div>
            </>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Action Controls */}
        <div className="p-5 flex items-center justify-between bg-stone-50 border-t border-stone-100">
          {capturedPreview ? (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-medium hover:bg-stone-100"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retake Photo</span>
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-agri-600 hover:bg-agri-700 text-white font-semibold shadow-soft-sm"
              >
                <Check className="w-5 h-5" />
                <span>Use This Photo</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-stone-600 font-medium hover:text-stone-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSnap}
                disabled={!!errorMsg}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-agri-600 hover:bg-agri-700 disabled:bg-stone-400 text-white font-semibold shadow-soft-md"
              >
                <Camera className="w-5 h-5" />
                <span>Snap Sample</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
