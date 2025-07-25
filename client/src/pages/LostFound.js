import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  MapPin, 
  Calendar, 
  User,
  Clock,
  Tag,
  QrCode,
  Filter,
  ChevronDown
} from 'lucide-react';
import { toast } from 'react-toastify';

const LostFound = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showNewItemModal, setShowNewItemModal] = useState(false);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'accessories', label: 'Accessories' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'books', label: 'Books & Stationery' },
    { value: 'keys', label: 'Keys & Cards' },
    { value: 'sports', label: 'Sports Equipment' },
    { value: 'other', label: 'Other' }
  ];

  const types = [
    { value: 'all', label: 'All Items' },
    { value: 'lost', label: 'Lost Items' },
    { value: 'found', label: 'Found Items' }
  ];

  // Sample data - replace with API calls
  useEffect(() => {
    setTimeout(() => {
      const sampleItems = [
        {
          _id: '1',
          title: 'iPhone 13 Pro',
          description: 'Blue iPhone 13 Pro found in the library on the second floor. Has a clear case with a university sticker.',
          category: 'electronics',
          type: 'found',
          location: 'Main Library - 2nd Floor',
          dateReported: new Date(Date.now() - 2 * 60 * 60 * 1000),
          contactInfo: 'john.doe@college.edu',
          reporter: {
            firstName: 'John',
            lastName: 'Doe'
          },
          status: 'active',
          qrCode: 'QR123456',
          imageUrl: null
        },
        {
          _id: '2',
          title: 'Black Backpack',
          description: 'Lost my black Nike backpack containing laptop and textbooks. Lost somewhere between the cafeteria and CS building.',
          category: 'accessories',
          type: 'lost',
          location: 'Cafeteria to CS Building',
          dateReported: new Date(Date.now() - 4 * 60 * 60 * 1000),
          contactInfo: 'jane.smith@college.edu',
          reporter: {
            firstName: 'Jane',
            lastName: 'Smith'
          },
          status: 'active',
          qrCode: null,
          imageUrl: null
        },
        {
          _id: '3',
          title: 'Calculus Textbook',
          description: 'Found a calculus textbook with name "Alex Johnson" written inside. Found in classroom B-205.',
          category: 'books',
          type: 'found',
          location: 'Classroom B-205',
          dateReported: new Date(Date.now() - 6 * 60 * 60 * 1000),
          contactInfo: 'admin@college.edu',
          reporter: {
            firstName: 'Security',
            lastName: 'Office'
          },
          status: 'active',
          qrCode: 'QR789012',
          imageUrl: null
        },
        {
          _id: '4',
          title: 'Silver Watch',
          description: 'Lost my silver Fossil watch in the gymnasium. It has sentimental value. Reward offered.',
          category: 'accessories',
          type: 'lost',
          location: 'Gymnasium',
          dateReported: new Date(Date.now() - 8 * 60 * 60 * 1000),
          contactInfo: 'mike.wilson@college.edu',
          reporter: {
            firstName: 'Mike',
            lastName: 'Wilson'
          },
          status: 'active',
          qrCode: null,
          imageUrl: null
        }
      ];
      
      setItems(sampleItems);
      setFilteredItems(sampleItems);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = items;

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(item => item.type === selectedType);
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.dateReported) - new Date(a.dateReported));

    setFilteredItems(filtered);
  }, [items, searchTerm, selectedCategory, selectedType]);

  const formatDate = (date) => {
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const getTypeColor = (type) => {
    return type === 'lost' 
      ? 'bg-red-100 text-red-800 border-red-200' 
      : 'bg-green-100 text-green-800 border-green-200';
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'electronics': return '📱';
      case 'accessories': return '👜';
      case 'clothing': return '👕';
      case 'books': return '📚';
      case 'keys': return '🔑';
      case 'sports': return '⚽';
      default: return '📦';
    }
  };

  const handleContact = (contactInfo) => {
    // Copy email to clipboard or open email client
    navigator.clipboard.writeText(contactInfo);
    toast.success('Contact email copied to clipboard!');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Lost & Found</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
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
            <Search className="w-7 h-7 mr-2 text-blue-600" />
            Lost & Found
          </h1>
          <p className="text-gray-600 mt-1">Report lost items or help others find their belongings</p>
        </div>
        <button
          onClick={() => setShowNewItemModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Report Item</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Lost Items</p>
              <p className="text-2xl font-bold text-red-900">
                {items.filter(item => item.type === 'lost').length}
              </p>
            </div>
            <div className="text-2xl">😞</div>
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Found Items</p>
              <p className="text-2xl font-bold text-green-900">
                {items.filter(item => item.type === 'found').length}
              </p>
            </div>
            <div className="text-2xl">😊</div>
          </div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">This Week</p>
              <p className="text-2xl font-bold text-blue-900">
                {items.filter(item => {
                  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                  return item.dateReported >= weekAgo;
                }).length}
              </p>
            </div>
            <div className="text-2xl">📅</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search items, descriptions, or locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {types.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
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

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg p-8 shadow-sm border border-gray-200 text-center">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Image placeholder */}
              <div className="h-48 bg-gray-100 flex items-center justify-center">
                <div className="text-4xl">
                  {getCategoryIcon(item.category)}
                </div>
              </div>

              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(item.type)}`}>
                      {item.type.toUpperCase()}
                    </span>
                    {item.qrCode && (
                      <QrCode className="w-4 h-4 text-blue-600" title="QR Code Available" />
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDate(item.dateReported)}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {item.description}
                </p>

                {/* Location */}
                <div className="flex items-center text-sm text-gray-600 mb-4">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{item.location}</span>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="w-4 h-4 mr-1" />
                    <span>
                      {item.reporter.firstName} {item.reporter.lastName}
                    </span>
                  </div>

                  <button
                    onClick={() => handleContact(item.contactInfo)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded-md transition-colors"
                  >
                    Contact
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

export default LostFound;
