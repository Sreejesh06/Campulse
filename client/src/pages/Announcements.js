import React, { useState, useEffect } from 'react';
import { 
  Megaphone, 
  Plus, 
  Search, 
  Filter, 
  Pin, 
  Heart, 
  MessageCircle,
  Clock,
  User,
  ChevronDown
} from 'lucide-react';
import { toast } from 'react-toastify';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showNewAnnouncementModal, setShowNewAnnouncementModal] = useState(false);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'academic', label: 'Academic' },
    { value: 'events', label: 'Events' },
    { value: 'hostel', label: 'Hostel' },
    { value: 'sports', label: 'Sports' },
    { value: 'placement', label: 'Placement' },
    { value: 'general', label: 'General' }
  ];

  // Sample data - replace with API calls
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const sampleAnnouncements = [
        {
          _id: '1',
          title: 'New Library Timings',
          content: 'The library will now be open from 8 AM to 10 PM on weekdays and 9 AM to 6 PM on weekends.',
          category: 'academic',
          priority: 'high',
          isPinned: true,
          author: {
            firstName: 'Admin',
            lastName: 'User'
          },
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          likes: 24,
          comments: 8,
          isLiked: false
        },
        {
          _id: '2',
          title: 'Annual Sports Meet 2024',
          content: 'Registration for the Annual Sports Meet is now open. Various events including cricket, football, basketball, and athletics will be held from March 15-17.',
          category: 'sports',
          priority: 'medium',
          isPinned: false,
          author: {
            firstName: 'Sports',
            lastName: 'Committee'
          },
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          likes: 156,
          comments: 32,
          isLiked: true
        },
        {
          _id: '3',
          title: 'Placement Drive - TechCorp',
          content: 'TechCorp will be conducting an on-campus placement drive for final year students. Eligible branches: CSE, IT, ECE. Registration deadline: March 10.',
          category: 'placement',
          priority: 'high',
          isPinned: true,
          author: {
            firstName: 'Placement',
            lastName: 'Cell'
          },
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
          likes: 89,
          comments: 15,
          isLiked: false
        }
      ];
      
      setAnnouncements(sampleAnnouncements);
      setFilteredAnnouncements(sampleAnnouncements);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = announcements;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(announcement => announcement.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(announcement =>
        announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        announcement.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by pinned first, then by creation date
    filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    setFilteredAnnouncements(filtered);
  }, [announcements, searchTerm, selectedCategory]);

  const handleLike = async (announcementId) => {
    try {
      // API call would go here
      setAnnouncements(prev => prev.map(announcement => {
        if (announcement._id === announcementId) {
          return {
            ...announcement,
            isLiked: !announcement.isLiked,
            likes: announcement.isLiked ? announcement.likes - 1 : announcement.likes + 1
          };
        }
        return announcement;
      }));
    } catch (error) {
      toast.error('Failed to update like');
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'academic': return 'bg-blue-100 text-blue-800';
      case 'events': return 'bg-purple-100 text-purple-800';
      case 'hostel': return 'bg-green-100 text-green-800';
      case 'sports': return 'bg-orange-100 text-orange-800';
      case 'placement': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Megaphone className="w-7 h-7 mr-2 text-blue-600" />
            Announcements
          </h1>
          <p className="text-gray-600 mt-1">Stay updated with campus announcements</p>
        </div>
        <button
          onClick={() => setShowNewAnnouncementModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Announcement</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search announcements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 text-center">
            <Megaphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No announcements found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          filteredAnnouncements.map((announcement) => (
            <div
              key={announcement._id}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {announcement.isPinned && (
                    <Pin className="w-4 h-4 text-red-600" />
                  )}
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(announcement.priority)}`}>
                    {announcement.priority.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(announcement.category)}`}>
                    {announcement.category.charAt(0).toUpperCase() + announcement.category.slice(1)}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  {formatTimeAgo(announcement.createdAt)}
                </div>
              </div>

              {/* Content */}
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                {announcement.title}
              </h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                {announcement.content}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>
                    {announcement.author.firstName} {announcement.author.lastName}
                  </span>
                </div>

                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleLike(announcement._id)}
                    className={`flex items-center space-x-1 text-sm transition-colors ${
                      announcement.isLiked 
                        ? 'text-red-600 hover:text-red-700' 
                        : 'text-gray-600 hover:text-red-600'
                    }`}
                  >
                    <Heart 
                      className={`w-4 h-4 ${announcement.isLiked ? 'fill-current' : ''}`} 
                    />
                    <span>{announcement.likes}</span>
                  </button>

                  <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    <span>{announcement.comments}</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Announcements;
