/**
 * Avatar UI Controller
 * Handles the avatar customization modal and user interactions
 *
 * @author GitHub Copilot
 */
(function() {
    var avatarManager = null;
    var currentStream = null;
    
    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        avatarManager = new BULANCI.AvatarManager();
        initializeAvatarUI();
    });
    
    function initializeAvatarUI() {
        // Get DOM elements
        var avatarIconBtn = document.getElementById('avatar-icon-btn');
        var avatarModal = document.getElementById('avatar-modal');
        var avatarModalClose = document.getElementById('avatar-modal-close');
        var avatarCancelBtn = document.getElementById('avatar-cancel-btn');
        var uploadBtn = document.getElementById('upload-avatar-btn');
        var cameraBtn = document.getElementById('camera-avatar-btn');
        var removeBtn = document.getElementById('remove-avatar-btn');
        var fileInput = document.getElementById('avatar-file-input');
        var avatarPreview = document.getElementById('avatar-preview');
        var avatarIconPlaceholder = document.getElementById('avatar-icon-placeholder');
        var uploadView = document.getElementById('avatar-upload-view');
        var cameraView = document.getElementById('camera-view');
        var cameraVideo = document.getElementById('camera-video');
        var captureBtn = document.getElementById('capture-btn');
        var cameraCancelBtn = document.getElementById('camera-cancel-btn');
        
        // Load existing avatar if present
        updateAvatarDisplay();
        
        // Open modal
        avatarIconBtn.addEventListener('click', function() {
            avatarModal.style.display = 'flex';
            updateAvatarDisplay();
        });
        
        // Close modal
        function closeModal() {
            avatarModal.style.display = 'none';
            stopCamera();
            uploadView.style.display = 'flex';
            cameraView.style.display = 'none';
            clearMessage();
        }
        
        avatarModalClose.addEventListener('click', closeModal);
        avatarCancelBtn.addEventListener('click', closeModal);
        
        // Upload button
        uploadBtn.addEventListener('click', function() {
            fileInput.click();
        });
        
        // File input change
        fileInput.addEventListener('change', function(e) {
            var file = e.target.files[0];
            if (file) {
                showMessage('Processing image...', 'info');
                avatarManager.processImageFile(file, function(err, processedData) {
                    if (err) {
                        showMessage(err.message, 'error');
                    } else {
                        avatarManager.saveAvatar(processedData);
                        updateAvatarDisplay();
                        showMessage('Avatar saved successfully!', 'success');
                        
                        // Notify game of avatar change
                        if (window.game && window.game.onAvatarChanged) {
                            window.game.onAvatarChanged(processedData);
                        }
                    }
                    fileInput.value = ''; // Reset input
                });
            }
        });
        
        // Camera button
        cameraBtn.addEventListener('click', function() {
            uploadView.style.display = 'none';
            cameraView.style.display = 'flex';
            startCamera();
        });
        
        // Capture button
        captureBtn.addEventListener('click', function() {
            showMessage('Processing photo...', 'info');
            avatarManager.captureFromCamera(cameraVideo, function(err, processedData) {
                if (err) {
                    showMessage(err.message, 'error');
                } else {
                    avatarManager.saveAvatar(processedData);
                    updateAvatarDisplay();
                    showMessage('Avatar saved successfully!', 'success');
                    stopCamera();
                    uploadView.style.display = 'flex';
                    cameraView.style.display = 'none';
                    
                    // Notify game of avatar change
                    if (window.game && window.game.onAvatarChanged) {
                        window.game.onAvatarChanged(processedData);
                    }
                }
            });
        });
        
        // Camera cancel button
        cameraCancelBtn.addEventListener('click', function() {
            stopCamera();
            uploadView.style.display = 'flex';
            cameraView.style.display = 'none';
            clearMessage();
        });
        
        // Remove avatar button
        removeBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to remove your avatar?')) {
                avatarManager.removeAvatar();
                updateAvatarDisplay();
                showMessage('Avatar removed.', 'success');
                
                // Notify game of avatar removal
                if (window.game && window.game.onAvatarChanged) {
                    window.game.onAvatarChanged(null);
                }
            }
        });
        
        // Start camera
        function startCamera() {
            clearMessage();
            avatarManager.startCamera(cameraVideo, function(err, stream) {
                if (err) {
                    showMessage(err.message, 'error');
                    uploadView.style.display = 'flex';
                    cameraView.style.display = 'none';
                } else {
                    currentStream = stream;
                }
            });
        }
        
        // Stop camera
        function stopCamera() {
            if (currentStream) {
                avatarManager.stopCamera(currentStream);
                currentStream = null;
                cameraVideo.srcObject = null;
            }
        }
        
        // Update avatar display
        function updateAvatarDisplay() {
            var avatar = avatarManager.getAvatar();
            
            // Update preview in modal
            if (avatar) {
                avatarPreview.innerHTML = '<img src="' + avatar + '" alt="Avatar" />';
                removeBtn.style.display = 'block';
            } else {
                avatarPreview.innerHTML = '<span>No avatar set</span>';
                removeBtn.style.display = 'none';
            }
            
            // Update icon in menu
            if (avatar) {
                avatarIconPlaceholder.innerHTML = '<img src="' + avatar + '" alt="Avatar" />';
            } else {
                avatarIconPlaceholder.innerHTML = '👤';
            }
        }
        
        // Show message
        function showMessage(text, type) {
            var container = document.getElementById('avatar-message-container');
            var className = type === 'error' ? 'error-message' : (type === 'success' ? 'success-message' : 'info-message');
            container.innerHTML = '<div class="' + className + '">' + text + '</div>';
        }
        
        // Clear message
        function clearMessage() {
            var container = document.getElementById('avatar-message-container');
            container.innerHTML = '';
        }
        
        // Make avatar manager globally accessible
        window.avatarManager = avatarManager;
    }
})();
