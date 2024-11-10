// AdminPanel.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

import { 
  User,
  Mail, 
  Phone,
  Trash2,
  Edit2,
  Search,
  X,
  UserCheck,
  UserX,
  RefreshCw,
  Filter,
  Download
} from 'lucide-react';

const AdminPanel = ({ theme }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, blocked
  const [editingUser, setEditingUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Load users
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setUsers(data.users);
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone.includes(searchTerm);
    
    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && user.status === filterStatus;
  });

  // Update user
  const handleUpdateUser = async (userId, updateData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, ...updateData } : user
      ));
      setEditingUser(null);

    } catch (error) {
      setError(error.message);
    }
  };

  // Delete user
  const handleDeleteUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      // Update local state
      setUsers(users.filter(user => user.id !== userId));
      setShowDeleteModal(false);
      setUserToDelete(null);

    } catch (error) {
      setError(error.message);
    }
  };

  // Export users data
  const handleExportData = () => {
    const exportData = filteredUsers.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      status: user.status,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <Card className={`w-full max-w-6xl mx-auto shadow-xl ${
        theme === 'dark' 
          ? 'bg-gray-800/90 border-gray-700' 
          : 'bg-white/90 backdrop-blur-sm'
      }`}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="kurdish-text text-2xl">
              بەڕێڤەبرن
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleExportData}
                className="kurdish-text"
              >
                <Download className="h-4 w-4 ml-2" />
                هەناردنا داتایان
              </Button>
              <Button
                variant="outline"
                onClick={fetchUsers}
                className="kurdish-text"
              >
                <RefreshCw className="h-4 w-4 ml-2" />
                نویکرن
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Search and Filter */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="گەڕیان..."
                className="pl-10 kurdish-text"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2.5"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
                className="kurdish-text"
              >
                هەمی
              </Button>
              <Button
                variant={filterStatus === 'active' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('active')}
                className="kurdish-text"
              >
                چالاک
              </Button>
              <Button
                variant={filterStatus === 'blocked' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('blocked')}
                className="kurdish-text text-red-500"
              >
                بلۆککری
              </Button>
            </div>
          </div>

          {/* Users List */}
          <div className="space-y-4">
            {filteredUsers.map(user => (
              <Card key={user.id} className={`${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <CardContent className="p-4">
                  {editingUser?.id === user.id ? (
                    // Edit Mode
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      handleUpdateUser(user.id, editingUser);
                    }} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                          value={editingUser.name}
                          onChange={(e) => setEditingUser({
                            ...editingUser,
                            name: e.target.value
                          })}
                          placeholder="ناڤ"
                          className="kurdish-text"
                        />
                        <Input
                          value={editingUser.email}
                          onChange={(e) => setEditingUser({
                            ...editingUser,
                            email: e.target.value
                          })}
                          placeholder="ئیمەیل"
                          className="kurdish-text"
                        />
                        <Input
                          value={editingUser.phone}
                          onChange={(e) => setEditingUser({
                            ...editingUser,
                            phone: e.target.value
                          })}
                          placeholder="ژمارا تەلەفۆنێ"
                          className="kurdish-text"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setEditingUser(null)}
                          className="kurdish-text"
                        >
                          بەتالکرن
                        </Button>
                        <Button
                          type="submit"
                          className="kurdish-text"
                        >
                          پاراستن
                        </Button>
                      </div>
                    </form>
                  ) : (
                    // View Mode
                    <div className="flex items-center justify-between">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                        <div className="space-y-1">
                          <div className="text-sm text-gray-500 dark:text-gray-400">ناڤ</div>
                          <div className="kurdish-text">{user.name}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm text-gray-500 dark:text-gray-400">ئیمەیل</div>
                          <div className="kurdish-text">{user.email}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm text-gray-500 dark:text-gray-400">ژمارا تەلەفۆنێ</div>
                          <div className="kurdish-text">{user.phone}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => handleUpdateUser(user.id, {
                            status: user.status === 'active' ? 'blocked' : 'active'
                          })}
                          className={`kurdish-text ${
                            user.status === 'blocked' ? 'text-red-500' : 'text-green-500'
                          }`}
                        >
                          {user.status === 'blocked' ? (
                            <UserX className="h-4 w-4 ml-2" />
                          ) : (
                            <UserCheck className="h-4 w-4 ml-2" />
                          )}
                          {user.status === 'blocked' ? 'بلۆککری' : 'چالاک'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setEditingUser(user)}
                          className="kurdish-text"
                        >
                          <Edit2 className="h-4 w-4 ml-2" />
                          گوهۆڕین
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setUserToDelete(user);
                            setShowDeleteModal(true);
                          }}
                          className="kurdish-text text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className={`w-full max-w-md ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4 kurdish-text">
                    ژێبرنا هەژماری
                  </h3>
                  <p className="mb-6 kurdish-text">
                    دڤێت تۆ هەژمارا {userToDelete?.name} ژێببەی؟
                  </p>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowDeleteModal(false);
                        setUserToDelete(null);
                      }}
                      className="kurdish-text"
                    >
                      بەتالکرن
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDeleteUser(userToDelete?.id)}
                      className="kurdish-text"
                    >
                      ژێبرن
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;
