import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
  const [elections, setElections] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalElections: 0,
    activeElections: 0,
    totalUsers: 0,
    totalVotes: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [electionsRes, usersRes] = await Promise.all([
        axios.get('/api/admin/elections'),
        axios.get('/api/admin/users')
      ]);
      
      setElections(electionsRes.data);
      setUsers(usersRes.data);
      
      // Calculate stats
      const totalVotes = electionsRes.data.reduce((sum, election) => sum + election.totalVotes, 0);
      const activeElections = electionsRes.data.filter(e => e.currentStatus === 'active').length;
      
      setStats({
        totalElections: electionsRes.data.length,
        activeElections,
        totalUsers: usersRes.data.length,
        totalVotes
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId) => {
    try {
      await axios.patch(`/api/admin/users/${userId}/toggle-status`);
      fetchAdminData(); // Refresh data
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const deleteElection = async (electionId, electionTitle, totalVotes) => {
    const hasVotes = totalVotes > 0;
    const confirmMessage = hasVotes 
      ? `⚠️ WARNING: This will permanently delete "${electionTitle}" and ALL ${totalVotes} votes cast in this election.\n\nThis action cannot be undone. Are you absolutely sure?`
      : `Are you sure you want to delete "${electionTitle}"?`;
    
    if (window.confirm(confirmMessage)) {
      try {
        const response = await axios.delete(`/api/admin/elections/${electionId}`);
        alert(response.data.message); // Show success message
        fetchAdminData(); // Refresh data
      } catch (error) {
        console.error('Error deleting election:', error);
        alert(error.response?.data?.message || 'Failed to delete election');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Manage elections, users, and view system statistics
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-primary-600">{stats.totalElections}</div>
            <div className="text-sm text-gray-600">Total Elections</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">{stats.activeElections}</div>
            <div className="text-sm text-gray-600">Active Elections</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
            <div className="text-sm text-gray-600">Registered Users</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-purple-600">{stats.totalVotes}</div>
            <div className="text-sm text-gray-600">Total Votes Cast</div>
          </div>
        </div>

        {/* Elections Management */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">Elections</h2>
            <Link
              to="/admin/create-election"
              className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700"
            >
              Create New Election
            </Link>
          </div>
          
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Votes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {elections.map((election) => (
                  <tr key={election._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {election.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        election.currentStatus === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : election.currentStatus === 'completed'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {election.currentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {election.totalVotes}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(election.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Link
                        to={`/results/${election._id}`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        View Results
                      </Link>
                      <button
                        onClick={() => deleteElection(election._id, election.title, election.totalVotes)}
                        className={`${
                          election.totalVotes > 0 
                            ? 'text-red-700 hover:text-red-900 font-semibold' 
                            : 'text-red-600 hover:text-red-900'
                        }`}
                        title={election.totalVotes > 0 ? `⚠️ Will delete ${election.totalVotes} votes` : 'Delete election'}
                      >
                        {election.totalVotes > 0 ? '⚠️ Force Delete' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Users Management */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Users</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.slice(0, 10).map((user) => (
                  <tr key={user._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.studentId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.isActive 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => toggleUserStatus(user._id)}
                        className={`${
                          user.isActive 
                            ? 'text-red-600 hover:text-red-900'
                            : 'text-green-600 hover:text-green-900'
                        }`}
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length > 10 && (
              <div className="px-6 py-3 bg-gray-50 text-sm text-gray-500">
                Showing 10 of {users.length} users
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;