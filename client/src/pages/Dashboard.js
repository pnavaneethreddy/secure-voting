import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const [elections, setElections] = useState([]);
  const [voteHistory, setVoteHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Try to get active elections first
      let electionsData = [];
      try {
        const electionsRes = await axios.get('/api/elections');
        electionsData = electionsRes.data;
        console.log('Dashboard: Active elections loaded:', electionsData.length);
      } catch (electionsError) {
        console.log('Dashboard: Active elections failed, trying all elections...');
        try {
          // Fallback to all elections and filter active ones
          const allElectionsRes = await axios.get('/api/elections/all');
          const now = new Date();
          electionsData = allElectionsRes.data.filter(election => {
            const isActive = election.isCurrentlyActive === true || 
                           (new Date(election.startDate) <= now && new Date(election.endDate) >= now);
            return isActive;
          });
          console.log('Dashboard: Filtered active elections:', electionsData.length);
        } catch (fallbackError) {
          console.error('Dashboard: Both elections APIs failed:', fallbackError);
        }
      }
      
      // Get vote history
      let historyData = [];
      try {
        const historyRes = await axios.get('/api/votes/history');
        historyData = historyRes.data;
        console.log('Dashboard: Vote history loaded:', historyData.length);
      } catch (historyError) {
        console.error('Dashboard: Vote history failed:', historyError);
      }
      
      setElections(electionsData);
      setVoteHistory(historyData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {user?.firstName}!
          </h1>
          <p className="mt-2 text-gray-600">
            Participate in secure, anonymous elections
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                  <span className="text-green-600 font-semibold">🗳️</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Elections</p>
                <p className="text-2xl font-semibold text-gray-900">{elections.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">✅</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Your Votes</p>
                <p className="text-2xl font-semibold text-gray-900">{voteHistory.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                  <span className="text-yellow-600 font-semibold">⏳</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Votes</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {elections.filter(e => !e.hasVoted).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Active Elections */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Active Elections
          </h2>
          {elections.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-500">No active elections at the moment</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {elections.map((election) => (
                <div
                  key={election._id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-green-500"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {election.title}
                    </h3>
                    <div className="flex flex-col space-y-1 ml-2">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                      {election.hasVoted && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Voted
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
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
                      Results
                    </Link>
                  </div>
                  
                  {/* Time remaining indicator */}
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div
                        className="bg-green-500 h-1 rounded-full transition-all duration-300"
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
                        {Math.ceil((new Date(election.endDate) - new Date()) / (1000 * 60 * 60 * 24))} days left
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Vote History */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Your Vote History
          </h2>
          {voteHistory.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-500">You haven't voted in any elections yet</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Election
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Voted At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {voteHistory.map((vote, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {vote.electionTitle}
                        </div>
                        <div className="text-sm text-gray-500">
                          {vote.electionDescription}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(vote.votedAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Completed
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
