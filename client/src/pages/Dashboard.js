import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  Megaphone, 
  Search, 
  Calendar, 
  MessageSquare, 
  TrendingUp,
  Clock,
  Bell
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  const stats = [
    {
      name: 'Announcements',
      value: '12',
      change: '+2 today',
      icon: Megaphone,
      color: 'bg-blue-500'
    },
    {
      name: 'Lost Items',
      value: '8',
      change: '+1 this week',
      icon: Search,
      color: 'bg-green-500'
    },
    {
      name: 'Classes Today',
      value: '5',
      change: 'Next at 2:00 PM',
      icon: Calendar,
      color: 'bg-purple-500'
    },
    {
      name: 'Open Complaints',
      value: '3',
      change: '1 resolved',
      icon: MessageSquare,
      color: 'bg-red-500'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'announcement',
      title: 'New Library Timings',
      time: '2 hours ago',
      priority: 'high'
    },
    {
      id: 2,
      type: 'lost-found',
      title: 'Found: iPhone 13 in Cafeteria',
      time: '4 hours ago',
      priority: 'medium'
    },
    {
      id: 3,
      type: 'complaint',
      title: 'Your water complaint was resolved',
      time: '1 day ago',
      priority: 'low'
    }
  ];

  const upcomingClasses = [
    {
      id: 1,
      subject: 'Data Structures',
      time: '2:00 PM - 3:00 PM',
      room: 'CS-101',
      professor: 'Dr. Smith'
    },
    {
      id: 2,
      subject: 'Database Systems',
      time: '3:30 PM - 4:30 PM',
      room: 'CS-102',
      professor: 'Prof. Johnson'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p className="text-blue-100">
          Here's what's happening on campus today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.change}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Bell className="w-5 h-5 mr-2 text-blue-600" />
                Recent Activities
              </h2>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.priority === 'high' ? 'bg-red-500' :
                    activity.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Classes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-purple-600" />
              Upcoming Classes
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {upcomingClasses.map((classItem) => (
                <div key={classItem.id} className="border-l-4 border-purple-500 pl-4">
                  <p className="font-medium text-gray-900">{classItem.subject}</p>
                  <p className="text-sm text-gray-600">{classItem.time}</p>
                  <p className="text-sm text-gray-500">{classItem.room} • {classItem.professor}</p>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 text-purple-600 hover:text-purple-700 text-sm font-medium border border-purple-200 rounded-lg py-2 hover:bg-purple-50 transition-colors">
              View Full Timetable
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <Megaphone className="w-8 h-8 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">View Announcements</span>
          </button>
          <button className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <Search className="w-8 h-8 text-green-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Report Lost Item</span>
          </button>
          <button className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <Calendar className="w-8 h-8 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Check Timetable</span>
          </button>
          <button className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <MessageSquare className="w-8 h-8 text-red-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">File Complaint</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
