import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Elections = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      const res = await axios.get('/api/elections');
      setElections(res.data);
    } catch (error) {
      setError('Failed to fetch elections');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading elections...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">All Elections</h1>
          <p className="mt-2 text-gray-600">
            View and participate in active elections
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {elections.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">🗳️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Active Elections
            </h3>
            <p className="text-gray-500">
              There are no elections available at the moment. Check back later!
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {elections.map((election) => (
              <div
                key={election._id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {election.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                      election.hasVoted 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {election.hasVoted ? 'Voted' : 'Available'}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {election.description}
                  </p>

                  <div className="space-y-2 text-xs text-gray-500 mb-4">
                    <div className="flex justify-between">
                      <span>Candidates:</span>
                      <span>{election.candidates?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Votes:</span>
                      <span>{election.totalVotes || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ends:</span>
                      <span>{new Date(election.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {!election.hasVoted ? (
                      <Link
                        to={`/vote/${election._id}`}
                        className="flex-1 bg-primary-600 text-white text-center px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
                      >
                        Vote Now
                      </Link>
                    ) : (
                      <div className="flex-1 bg-gray-100 text-gray-500 text-center px-4 py-2 rounded-md text-sm font-medium">
                        Already Voted
                      </div>
                    )}
                    
                    <Link
                      to={`/results/${election._id}`}
                      className="flex-1 bg-gray-600 text-white text-center px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
                    >
                      View Results
                    </Link>
                  </div>
                </div>

                {/* Progress indicator for time remaining */}
                <div className="px-6 pb-4">
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div
                      className="bg-primary-600 h-1 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.max(0, Math.min(100, 
                          ((new Date() - new Date(election.startDate)) / 
                           (new Date(election.endDate) - new Date(election.startDate))) * 100
                        ))}%`
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Started: {new Date(election.startDate).toLocaleDateString()}</span>
                    <span>
                      {new Date() > new Date(election.endDate) 
                        ? 'Ended' 
                        : `${Math.ceil((new Date(election.endDate) - new Date()) / (1000 * 60 * 60 * 24))} days left`
                      }
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Elections;