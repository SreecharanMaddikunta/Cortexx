import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = Details, 2 = OTP
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (phone.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }
    setLoading(true);
    setError('');
    
    try {
      const res = await axios.post('http://localhost:5000/api/auth/send-otp', { phone, name });
      if (res.data.demoOtp) {
        setDemoOtp(res.data.demoOtp);
      }
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('http://localhost:5000/api/auth/verify-otp', { phone, otp, name });
      localStorage.setItem('farmer_token', res.data.token);
      localStorage.setItem('farmer_name', res.data.name);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl relative z-10 overflow-hidden"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">AgriVision AI</h1>
          <p className="text-green-100 font-medium">Smart Crop Management</p>
        </div>

        {error && (
          <div className="bg-red-500/80 text-white p-3 rounded-xl text-sm mb-4 text-center">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.form 
              key="step1"
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              onSubmit={handleSendOTP} 
              className="space-y-6"
            >
              <div>
                <label className="block text-green-100 text-sm font-semibold mb-2">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-5 py-4 rounded-xl bg-white/20 border border-white/30 text-white placeholder-green-200 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                  placeholder="e.g. Ramu"
                />
              </div>
              <div>
                <label className="block text-green-100 text-sm font-semibold mb-2">Phone Number</label>
                <input 
                  type="tel" 
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-5 py-4 rounded-xl bg-white/20 border border-white/30 text-white placeholder-green-200 focus:outline-none focus:ring-2 focus:ring-green-400 transition tracking-wider"
                  placeholder="+91 98765 43210"
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 mt-4 bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white font-bold rounded-xl shadow-lg transform transition active:scale-95 disabled:opacity-50 flex justify-center"
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </motion.form>
          ) : (
            <motion.form 
              key="step2"
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              onSubmit={handleVerifyOTP} 
              className="space-y-6"
            >
              <div className="text-center mb-6 text-green-100 text-sm">
                We sent a 6-digit verification code to <br/>
                <span className="font-bold text-white tracking-widest">{phone}</span>
                <button type="button" onClick={() => setStep(1)} className="block mx-auto mt-2 text-green-300 hover:text-white underline text-xs">Change Number</button>
              </div>

              {demoOtp && (
                <div className="bg-yellow-500/20 border border-yellow-500/50 p-3 rounded-xl mb-4 text-center">
                  <span className="text-yellow-100 text-sm">Demo Mode - Your OTP is: </span>
                  <span className="font-bold text-yellow-400 tracking-widest">{demoOtp}</span>
                </div>
              )}

              <div>
                <label className="block text-green-100 text-sm font-semibold mb-2 text-center">Enter OTP</label>
                <input 
                  type="text" 
                  required
                  maxLength="6"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-5 py-4 rounded-xl bg-white/20 border border-white/30 text-white placeholder-green-200 focus:outline-none focus:ring-2 focus:ring-green-400 transition text-center text-2xl tracking-[0.5em] font-mono"
                  placeholder="------"
                />
              </div>
              <button 
                type="submit" 
                disabled={loading || otp.length !== 6}
                className="w-full py-4 mt-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg transform transition active:scale-95 disabled:opacity-50 flex justify-center"
              >
                {loading ? "Verifying..." : "Verify & Login"}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Login;
