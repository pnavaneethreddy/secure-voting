import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Vote = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { generateOTP, verifyOTP, user } = useAuth();
  
  const [election, setElection] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [step, setStep] = useState(1); // 1: Select, 2: OTP, 3: Confirm
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchElection();
  }, [id]);

  const fetchElection = async () => {
    try {
      const res = await axios.get(`/api/elections/${id}`);
      setElection(res.data);
      
      if (res.data.hasVoted) {
        navigate(`/results/${id}`);
        return;
      }
      
      if (res.data.currentStatus !== 'active') {
        setError('This election is not currently active');
      }
    } catch (error) {
      setError('Election not found');
    } finally {
      setLoading(false);
    }
  };

  const handleCandidateSelect = (candidateId) => {
    setSelectedCandidate(candidateId);
    setError('');
  };

  const handleNext = async () => {
    if (!selectedCandidate) {
      setError('Please select a candidate');
      return;
    }

    setSubmitting(true);
    const result = await generateOTP();
    
    if (result.success) {
      setStep(2);
      setSuccess(result.message);
    } else {
      setError(result.message);
    }
    setSubmitting(false);
  };

  const handleOTPSubmit = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setSubmitting(true);
    const result = await verifyOTP(otp);
    
    if (result.success) {
      setStep(3);
      setError('');
    } else {
      setError(result.message);
    }
    setSubmitting(false);
  };

  const handleVoteSubmit = async () => {
    setSubmitting(true);
    
    try {
      const res = await axios.post('/api/votes', {
        electionId: id,
        candidateId: selectedCandidate,
        otp
      });

      setSuccess('Vote cast successfully!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to cast vote');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading election...</div>
      </div>
    );
  }

  if (error && !election) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  const selectedCandidateData = election?.candidates.find(c => c._id === selectedCandidate);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {election?.title}
        </h1>
        <p className="text-gray-600 mb-8">{election?.description}</p>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              1
            </div>
            <div className="ml-2 text-sm font-medium text-gray-900">Select</div>
          </div>
          <div className={`w-16 h-1 mx-4 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              2
            </div>
            <div className="ml-2 text-sm font-medium text-gray-900">Verify</div>
          </div>
          <div className={`w-16 h-1 mx-4 ${step >= 3 ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 3 ? 'bg-primary-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              3
            </div>
            <div className="ml-2 text-sm font-medium text-gray-900">Confirm</div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

        {/* Step 1: Candidate Selection */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Select Your Candidate</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {election?.candidates.map((candidate) => (
                <div
                  key={candidate._id}
                  className={`border-2 rounded-lg p-6 cursor-pointer transition-colors ${
                    selectedCandidate === candidate._id
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => handleCandidateSelect(candidate._id)}
                >
                  <h3 className="text-lg font-semibold text-gray-900">
                    {candidate.name}
                  </h3>
                  {candidate.description && (
                    <p className="text-gray-600 mt-2">{candidate.description}</p>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleNext}
                disabled={!selectedCandidate || submitting}
                className="bg-primary-600 text-white px-6 py-3 rounded-md font-medium hover:bg-primary-700 disabled:opacity-50"
              >
                {submitting ? 'Generating OTP...' : 'Next: Verify Identity'}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-6">Verify Your Identity</h2>
            <p className="text-gray-600 mb-2">
              We've sent a 6-digit verification code to:
            </p>
            <p className="font-medium text-gray-900 mb-6">
              {user?.email}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Please check your email and enter the code below to proceed with voting.
            </p>
            <div className="max-w-xs mx-auto">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit OTP"
                className="w-full px-4 py-3 text-center text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                maxLength="6"
              />
            </div>
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-xs text-yellow-800">
                  <strong>Development Mode:</strong> Use bypass code: <strong>123456</strong> (or check server console for real OTP)
                </p>
              </div>
            )}
            <div className="mt-8 flex justify-center space-x-4">
              <button
                onClick={() => setStep(1)}
                className="bg-gray-600 text-white px-6 py-3 rounded-md font-medium hover:bg-gray-700"
              >
                Back
              </button>
              <button
                onClick={handleOTPSubmit}
                disabled={otp.length !== 6 || submitting}
                className="bg-primary-600 text-white px-6 py-3 rounded-md font-medium hover:bg-primary-700 disabled:opacity-50"
              >
                {submitting ? 'Verifying...' : 'Verify & Continue'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Final Confirmation */}
        {step === 3 && (
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-6">Confirm Your Vote</h2>
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <p className="text-gray-600 mb-2">You are voting for:</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {selectedCandidateData?.name}
              </h3>
              {selectedCandidateData?.description && (
                <p className="text-gray-600 mt-2">{selectedCandidateData.description}</p>
              )}
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 text-sm">
                ⚠️ <strong>Important:</strong> Once submitted, your vote cannot be changed. 
                Your vote is anonymous and secure.
              </p>
            </div>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setStep(2)}
                className="bg-gray-600 text-white px-6 py-3 rounded-md font-medium hover:bg-gray-700"
              >
                Back
              </button>
              <button
                onClick={handleVoteSubmit}
                disabled={submitting}
                className="bg-green-600 text-white px-8 py-3 rounded-md font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {submitting ? 'Submitting Vote...' : 'Cast My Vote'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Vote;
