import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const Results = () => {
  const { id } = useParams();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResults();
    
    // Auto-refresh results every 30 seconds for active elections
    const interval = setInterval(fetchResults, 30000);
    return () => clearInterval(interval);
  }, [id]);

  const fetchResults = async () => {
    try {
      const res = await axios.get(`/api/elections/${id}/results`);
      setResults(res.data);
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch results');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading results...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  const maxVotes = Math.max(...results.candidates.map(c => c.voteCount));

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Election Results
          </h1>
          <h2 className="text-xl text-gray-600 mb-4">{results.title}</h2>
          
          <div className="flex justify-center items-center space-x-8 text-sm text-gray-600">
            <div>
              <span className="font-medium">Total Votes:</span> {results.totalVotes}
            </div>
            <div>
              <span className="font-medium">Status:</span> 
              <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                results.status === 'completed' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {results.status === 'completed' ? 'Final Results' : 'Live Results'}
              </span>
            </div>
          </div>
        </div>

        {results.totalVotes === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No votes have been cast yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {results.candidates
              .sort((a, b) => b.voteCount - a.voteCount)
              .map((candidate, index) => (
                <div
                  key={candidate._id}
                  className={`border rounded-lg p-6 ${
                    index === 0 && candidate.voteCount > 0
                      ? 'border-yellow-400 bg-yellow-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      {index === 0 && candidate.voteCount > 0 && (
                        <span className="text-yellow-500 text-2xl mr-2">👑</span>
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {candidate.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Position #{index + 1}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {candidate.voteCount}
                      </div>
                      <div className="text-sm text-gray-600">
                        {candidate.percentage}%
                      </div>
                    </div>
                  </div>
                  
                  {/* Vote Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        index === 0 && candidate.voteCount > 0
                          ? 'bg-yellow-400'
                          : 'bg-primary-600'
                      }`}
                      style={{
                        width: `${maxVotes > 0 ? (candidate.voteCount / maxVotes) * 100 : 0}%`
                      }}
                    ></div>
                  </div>
                </div>
              ))}
          </div>
        )}

        {results.status === 'active' && (
          <div className="mt-8 text-center">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                🔄 Results are updating in real-time. 
                Election ends on {new Date(results.endDate).toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {results.status === 'completed' && (
          <div className="mt-8 text-center">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 text-sm">
                ✅ Election completed. These are the final results.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;