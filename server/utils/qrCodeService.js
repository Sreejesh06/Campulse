const QRCode = require('qrcode');
const crypto = require('crypto');

class QRCodeService {
  // Generate QR code for lost/found item pickup confirmation
  async generatePickupQR(itemId, type, additionalData = {}) {
    try {
      const qrData = {
        itemId: itemId.toString(),
        type: type, // 'lost' or 'found'
        timestamp: Date.now(),
        hash: crypto.createHash('md5').update(`${itemId}${type}${Date.now()}`).digest('hex'),
        purpose: 'pickup_confirmation',
        ...additionalData
      };

      const qrString = JSON.stringify(qrData);
      
      // Generate QR code as data URL
      const qrCodeDataURL = await QRCode.toDataURL(qrString, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 256
      });

      return {
        success: true,
        qrCode: qrCodeDataURL,
        qrData: qrString,
        metadata: qrData
      };
    } catch (error) {
      console.error('Error generating pickup QR code:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Generate QR code for complaint tracking
  async generateComplaintQR(complaintId, additionalData = {}) {
    try {
      const qrData = {
        complaintId: complaintId.toString(),
        timestamp: Date.now(),
        hash: crypto.createHash('md5').update(`${complaintId}${Date.now()}`).digest('hex'),
        purpose: 'complaint_tracking',
        trackingUrl: `${process.env.FRONTEND_URL}/complaints/${complaintId}`,
        ...additionalData
      };

      const qrString = JSON.stringify(qrData);
      
      const qrCodeDataURL = await QRCode.toDataURL(qrString, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#1a202c',
          light: '#ffffff'
        },
        width: 256
      });

      return {
        success: true,
        qrCode: qrCodeDataURL,
        qrData: qrString,
        metadata: qrData
      };
    } catch (error) {
      console.error('Error generating complaint QR code:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Generate QR code for timetable sharing
  async generateTimetableQR(timetableId, studentInfo = {}) {
    try {
      const qrData = {
        timetableId: timetableId.toString(),
        studentId: studentInfo.studentId,
        studentName: studentInfo.name,
        timestamp: Date.now(),
        hash: crypto.createHash('md5').update(`${timetableId}${Date.now()}`).digest('hex'),
        purpose: 'timetable_sharing',
        shareUrl: `${process.env.FRONTEND_URL}/timetable/shared/${timetableId}`,
        ...studentInfo
      };

      const qrString = JSON.stringify(qrData);
      
      const qrCodeDataURL = await QRCode.toDataURL(qrString, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#2d3748',
          light: '#ffffff'
        },
        width: 256
      });

      return {
        success: true,
        qrCode: qrCodeDataURL,
        qrData: qrString,
        metadata: qrData
      };
    } catch (error) {
      console.error('Error generating timetable QR code:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Generate QR code for user profile sharing
  async generateUserProfileQR(userId, userInfo = {}) {
    try {
      const qrData = {
        userId: userId.toString(),
        studentId: userInfo.studentId,
        name: userInfo.name,
        department: userInfo.department,
        timestamp: Date.now(),
        hash: crypto.createHash('md5').update(`${userId}${Date.now()}`).digest('hex'),
        purpose: 'profile_sharing',
        profileUrl: `${process.env.FRONTEND_URL}/profile/${userId}`,
        ...userInfo
      };

      const qrString = JSON.stringify(qrData);
      
      const qrCodeDataURL = await QRCode.toDataURL(qrString, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#4a5568',
          light: '#ffffff'
        },
        width: 256
      });

      return {
        success: true,
        qrCode: qrCodeDataURL,
        qrData: qrString,
        metadata: qrData
      };
    } catch (error) {
      console.error('Error generating profile QR code:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Generate QR code for event/announcement
  async generateAnnouncementQR(announcementId, announcementInfo = {}) {
    try {
      const qrData = {
        announcementId: announcementId.toString(),
        title: announcementInfo.title,
        category: announcementInfo.category,
        timestamp: Date.now(),
        hash: crypto.createHash('md5').update(`${announcementId}${Date.now()}`).digest('hex'),
        purpose: 'announcement_sharing',
        announcementUrl: `${process.env.FRONTEND_URL}/announcements/${announcementId}`,
        ...announcementInfo
      };

      const qrString = JSON.stringify(qrData);
      
      const qrCodeDataURL = await QRCode.toDataURL(qrString, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#2b6cb0',
          light: '#ffffff'
        },
        width: 256
      });

      return {
        success: true,
        qrCode: qrCodeDataURL,
        qrData: qrString,
        metadata: qrData
      };
    } catch (error) {
      console.error('Error generating announcement QR code:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Verify and decode QR data
  verifyQRData(qrString, expectedPurpose = null) {
    try {
      const qrData = JSON.parse(qrString);
      
      // Basic validation
      if (!qrData.timestamp || !qrData.hash || !qrData.purpose) {
        return {
          valid: false,
          error: 'Invalid QR code format'
        };
      }

      // Check purpose if specified
      if (expectedPurpose && qrData.purpose !== expectedPurpose) {
        return {
          valid: false,
          error: `Invalid QR code purpose. Expected: ${expectedPurpose}, Got: ${qrData.purpose}`
        };
      }

      // Check if QR code is not too old (24 hours)
      const ageInHours = (Date.now() - qrData.timestamp) / (1000 * 60 * 60);
      if (ageInHours > 24) {
        return {
          valid: false,
          error: 'QR code has expired'
        };
      }

      return {
        valid: true,
        data: qrData
      };
    } catch (error) {
      return {
        valid: false,
        error: 'Invalid QR code data'
      };
    }
  }

  // Generate bulk QR codes for multiple items
  async generateBulkQRCodes(items, type) {
    const results = [];
    
    for (const item of items) {
      let qrResult;
      
      switch (type) {
        case 'pickup':
          qrResult = await this.generatePickupQR(item.id, item.type, item.data);
          break;
        case 'complaint':
          qrResult = await this.generateComplaintQR(item.id, item.data);
          break;
        case 'timetable':
          qrResult = await this.generateTimetableQR(item.id, item.data);
          break;
        case 'profile':
          qrResult = await this.generateUserProfileQR(item.id, item.data);
          break;
        case 'announcement':
          qrResult = await this.generateAnnouncementQR(item.id, item.data);
          break;
        default:
          qrResult = { success: false, error: 'Unknown QR type' };
      }
      
      results.push({
        itemId: item.id,
        ...qrResult
      });
    }
    
    return results;
  }

  // Generate QR code as SVG (for better scalability)
  async generateQRCodeSVG(data, options = {}) {
    try {
      const qrSVG = await QRCode.toString(JSON.stringify(data), {
        type: 'svg',
        errorCorrectionLevel: 'M',
        margin: 1,
        color: {
          dark: options.darkColor || '#000000',
          light: options.lightColor || '#ffffff'
        },
        width: options.width || 256,
        ...options
      });

      return {
        success: true,
        svg: qrSVG
      };
    } catch (error) {
      console.error('Error generating SVG QR code:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Generate QR code with custom styling
  async generateStyledQR(data, style = {}) {
    const defaultStyle = {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 2,
      color: {
        dark: '#1a202c',
        light: '#ffffff'
      },
      width: 256
    };

    const qrOptions = { ...defaultStyle, ...style };

    try {
      const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(data), qrOptions);
      
      return {
        success: true,
        qrCode: qrCodeDataURL,
        style: qrOptions
      };
    } catch (error) {
      console.error('Error generating styled QR code:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Create singleton instance
const qrCodeService = new QRCodeService();

module.exports = qrCodeService;
