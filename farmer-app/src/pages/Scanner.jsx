import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, X, UploadCloud, Loader2, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

const Scanner = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [capturedImage, setCapturedImage] = useState(null); // Base64

  // Initialize camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setStream(mediaStream);
        if (videoRef.current) { videoRef.current.srcObject = mediaStream; }
      } catch (err) {
        setErrorMsg("Camera access denied. You can still upload a photo.");
      }
    };
    startCamera();
    return () => { if (stream) stream.getTracks().forEach(track => track.stop()); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach(track => track.stop());
  };

  const [validationError, setValidationError] = useState(null); // Stores the full error object

  const processImage = async (base64Image) => {
    setIsScanning(true);
    setValidationError(null);
    setErrorMsg('');
    stopCamera();
    
    try {
      const response = await axios.post('http://localhost:5000/api/scans/process', {
        imageBase64: base64Image,
        cropType: 'Tomato' // Hardcoded for MVP, ideally passed from context
      });
      
      setIsScanning(false);
      
      if (response.data.success) {
        // Valid diagnosis
        navigate('/diagnosis', { state: { report: response.data.report } });
      } else {
        // Validation failed (INVALID_IMAGE, UNSUPPORTED_CROP, LOW_CONFIDENCE, POOR_IMAGE_QUALITY)
        navigate('/diagnosis', { state: { errorData: response.data } });
      }
    } catch (error) {
      setErrorMsg("AI service is currently unavailable. Please try again.");
      setIsScanning(false);
    }
  };

  // Capture from live camera
  const captureAndScan = () => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    const base64 = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(base64);
    processImage(base64);
  };

  // Upload from Gallery
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setCapturedImage(reader.result);
      processImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleClose = () => {
    stopCamera();
    navigate(-1);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black z-[100] flex flex-col">
      <div className="flex justify-between items-center p-4 text-white z-10 absolute top-0 w-full bg-gradient-to-b from-black/70 to-transparent">
        <button onClick={handleClose} className="p-2 bg-gray-800/80 rounded-full hover:bg-gray-700 transition"><X size={24} /></button>
        <p className="font-medium drop-shadow-md">Position leaf in frame</p>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-gray-900">
        {!capturedImage && (
          <video ref={videoRef} autoPlay playsInline muted className="absolute min-w-full min-h-full object-cover opacity-90" />
        )}
        
        {capturedImage && (
          <img src={capturedImage} alt="Captured" className="absolute min-w-full min-h-full object-cover opacity-80" />
        )}

        {errorMsg && !isScanning && (
          <div className="absolute top-20 bg-red-500/90 text-white p-4 rounded-xl text-center max-w-xs z-20 shadow-xl">{errorMsg}</div>
        )}
        
        {!isScanning && !capturedImage && (
          <div className="w-72 h-72 border-2 border-white/30 rounded-3xl relative z-10 shadow-[0_0_0_4000px_rgba(0,0,0,0.4)] pointer-events-none">
            <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-green-500 rounded-tl-3xl -mt-1 -ml-1"></div>
            <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-green-500 rounded-tr-3xl -mt-1 -mr-1"></div>
            <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-green-500 rounded-bl-3xl -mb-1 -ml-1"></div>
            <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-green-500 rounded-br-3xl -mb-1 -mr-1"></div>
          </div>
        )}

        {isScanning && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-30 backdrop-blur-sm">
            <Loader2 size={64} className="text-green-500 animate-spin mb-4" />
            <h2 className="text-2xl font-bold text-white tracking-widest">ANALYZING</h2>
            <div className="text-green-300 mt-2 font-mono flex flex-col items-center">
               <p>✓ Checking image quality</p>
               <p>⏳ Detecting crop</p>
               <p>○ Analyzing disease</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-black pb-10 pt-6 px-6 flex justify-around items-center z-10">
        
        {/* Hidden File Input */}
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
        
        <button 
          onClick={() => fileInputRef.current.click()} 
          disabled={isScanning}
          className="p-4 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition flex flex-col items-center gap-1 disabled:opacity-50"
        >
          <ImageIcon size={24} />
          <span className="text-[10px] uppercase font-bold tracking-wider">Gallery</span>
        </button>
        
        <button 
          onClick={captureAndScan} 
          disabled={isScanning || !!errorMsg} 
          className="w-20 h-20 rounded-full bg-white border-4 border-gray-300 flex items-center justify-center active:scale-90 transition-transform disabled:opacity-50"
        >
          <div className="w-16 h-16 rounded-full border-2 border-black flex items-center justify-center">
            <Camera size={28} className="text-gray-900" />
          </div>
        </button>
        
        <div className="w-14"></div> {/* Spacer to keep camera button centered */}
      </div>
    </motion.div>
  );
};

export default Scanner;
