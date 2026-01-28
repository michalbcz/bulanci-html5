/**
 * Avatar Manager
 * Handles player avatar customization (upload, camera capture, storage)
 *
 * @class AvatarManager
 * @constructor
 * @author GitHub Copilot
 */
BULANCI.AvatarManager = function() {
    this.currentAvatar = null; // Base64 encoded image
    this.storageKey = 'bulanci_player_avatar';
    this.maxSize = 100; // Max avatar size in pixels
    this.maxFileSize = 500 * 1024; // 500KB max file size
    this.compressionQuality = 0.7; // JPEG compression quality
    
    // Load saved avatar from localStorage
    this.loadAvatar();
}

/**
 * Load avatar from localStorage
 */
BULANCI.AvatarManager.prototype.loadAvatar = function() {
    try {
        var saved = localStorage.getItem(this.storageKey);
        if (saved) {
            this.currentAvatar = saved;
        }
    } catch(e) {
        console.warn('Failed to load avatar from localStorage:', e);
    }
}

/**
 * Save avatar to localStorage
 */
BULANCI.AvatarManager.prototype.saveAvatar = function(avatarData) {
    try {
        if (avatarData) {
            localStorage.setItem(this.storageKey, avatarData);
            this.currentAvatar = avatarData;
            return true;
        }
    } catch(e) {
        console.warn('Failed to save avatar to localStorage:', e);
        return false;
    }
    return false;
}

/**
 * Remove avatar
 */
BULANCI.AvatarManager.prototype.removeAvatar = function() {
    try {
        localStorage.removeItem(this.storageKey);
        this.currentAvatar = null;
        return true;
    } catch(e) {
        console.warn('Failed to remove avatar:', e);
        return false;
    }
}

/**
 * Get current avatar
 */
BULANCI.AvatarManager.prototype.getAvatar = function() {
    return this.currentAvatar;
}

/**
 * Process uploaded image file
 */
BULANCI.AvatarManager.prototype.processImageFile = function(file, callback) {
    var self = this;
    
    // Validate file type
    if (!file.type.match(/^image\/(jpeg|jpg|png|gif)$/)) {
        callback(new Error('Invalid file type. Please use JPG, PNG, or GIF.'));
        return;
    }
    
    // Validate file size
    if (file.size > this.maxFileSize) {
        callback(new Error('File too large. Maximum size is 500KB.'));
        return;
    }
    
    var reader = new FileReader();
    reader.onload = function(e) {
        self.processImageData(e.target.result, callback);
    };
    reader.onerror = function() {
        callback(new Error('Failed to read file.'));
    };
    reader.readAsDataURL(file);
}

/**
 * Process image data (resize, compress, convert to circular)
 */
BULANCI.AvatarManager.prototype.processImageData = function(imageData, callback) {
    var self = this;
    var img = new Image();
    
    img.onload = function() {
        try {
            // Create canvas for processing
            var canvas = document.createElement('canvas');
            canvas.width = self.maxSize;
            canvas.height = self.maxSize;
            var ctx = canvas.getContext('2d');
            
            // Calculate dimensions to maintain aspect ratio
            var scale = Math.min(self.maxSize / img.width, self.maxSize / img.height);
            var width = img.width * scale;
            var height = img.height * scale;
            var x = (self.maxSize - width) / 2;
            var y = (self.maxSize - height) / 2;
            
            // Draw with circular clipping
            ctx.save();
            ctx.beginPath();
            ctx.arc(self.maxSize / 2, self.maxSize / 2, self.maxSize / 2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            
            // Draw image
            ctx.drawImage(img, x, y, width, height);
            ctx.restore();
            
            // Convert to base64 with compression
            var processedData = canvas.toDataURL('image/jpeg', self.compressionQuality);
            
            callback(null, processedData);
        } catch(e) {
            callback(new Error('Failed to process image: ' + e.message));
        }
    };
    
    img.onerror = function() {
        callback(new Error('Failed to load image.'));
    };
    
    img.src = imageData;
}

/**
 * Capture photo from camera
 */
BULANCI.AvatarManager.prototype.captureFromCamera = function(videoElement, callback) {
    var self = this;
    
    try {
        // Create canvas for snapshot
        var canvas = document.createElement('canvas');
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        var ctx = canvas.getContext('2d');
        
        // Draw current video frame
        ctx.drawImage(videoElement, 0, 0);
        
        // Get image data
        var imageData = canvas.toDataURL('image/jpeg', 0.95);
        
        // Process the captured image
        this.processImageData(imageData, callback);
    } catch(e) {
        callback(new Error('Failed to capture from camera: ' + e.message));
    }
}

/**
 * Start camera stream
 */
BULANCI.AvatarManager.prototype.startCamera = function(videoElement, callback) {
    // Check if getUserMedia is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        callback(new Error('Camera access not supported in this browser.'));
        return;
    }
    
    navigator.mediaDevices.getUserMedia({ 
        video: { 
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
        },
        audio: false 
    })
    .then(function(stream) {
        videoElement.srcObject = stream;
        videoElement.play();
        callback(null, stream);
    })
    .catch(function(err) {
        var message = 'Camera access denied.';
        if (err.name === 'NotAllowedError') {
            message = 'Camera access denied. Please allow camera access in your browser settings.';
        } else if (err.name === 'NotFoundError') {
            message = 'No camera found on this device.';
        }
        callback(new Error(message));
    });
}

/**
 * Stop camera stream
 */
BULANCI.AvatarManager.prototype.stopCamera = function(stream) {
    if (stream) {
        stream.getTracks().forEach(function(track) {
            track.stop();
        });
    }
}

/**
 * Draw avatar on canvas as circular image
 */
BULANCI.AvatarManager.prototype.drawAvatar = function(ctx, avatarData, x, y, size) {
    if (!avatarData) return;
    
    var img = new Image();
    img.src = avatarData;
    
    ctx.save();
    
    // Create circular clipping path
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    
    // Draw avatar image
    ctx.drawImage(img, x, y, size, size);
    
    ctx.restore();
}
