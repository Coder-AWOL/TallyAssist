// Document Scanner Functionality
class DocumentScanner {
    constructor() {
        this.videoElement = document.getElementById('cameraVideo');
        this.canvasElement = document.getElementById('cameraCanvas');
        this.previewCanvas = document.getElementById('previewCanvas');
        this.capturedImage = document.getElementById('capturedImage');
        this.ctx = this.canvasElement.getContext('2d');
        this.previewCtx = this.previewCanvas.getContext('2d');
        
        this.stream = null;
        this.currentFacingMode = 'environment'; // 'user' for front camera, 'environment' for back camera
        this.capturedPhoto = null;
        
        this.initializeScanner();
    }

    async initializeScanner() {
        try {
            await this.startCamera();
            this.setupEventListeners();
        } catch (error) {
            this.handleCameraError(error);
        }
    }

    async startCamera() {
        // Stop any existing stream
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }

        const constraints = {
            video: {
                facingMode: this.currentFacingMode,
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false
        };

        try {
            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.videoElement.srcObject = this.stream;
            
            // Wait for video to be ready
            await new Promise((resolve) => {
                this.videoElement.onloadedmetadata = () => {
                    resolve();
                };
            });
            
            // Set canvas dimensions to match video
            this.canvasElement.width = this.videoElement.videoWidth;
            this.canvasElement.height = this.videoElement.videoHeight;
            this.previewCanvas.width = this.videoElement.videoWidth;
            this.previewCanvas.height = this.videoElement.videoHeight;
            
        } catch (error) {
            throw new Error(`Camera access denied: ${error.message}`);
        }
    }

    setupEventListeners() {
        // Capture button
        document.getElementById('captureBtn').addEventListener('click', () => {
            this.capturePhoto();
        });

        // Switch camera button
        document.getElementById('switchCameraBtn').addEventListener('click', () => {
            this.switchCamera();
        });

        // Cancel camera button - FIXED
        document.getElementById('cancelCameraBtn').addEventListener('click', () => {
            this.cancelScan();
        });

        // Retake button
        document.getElementById('retakeBtn').addEventListener('click', () => {
            this.retakePhoto();
        });

        // Process button
        document.getElementById('processBtn').addEventListener('click', () => {
            this.processWithAI();
        });

        // Save image button
        document.getElementById('saveBtn').addEventListener('click', () => {
            this.saveImage();
        });

        // New scan button
        document.getElementById('newScanBtn').addEventListener('click', () => {
            this.newScan();
        });

        // Create expense button
        document.getElementById('createExpenseBtn').addEventListener('click', () => {
            this.createExpense();
        });

        // Save to invoices button
        document.getElementById('saveToInvoicesBtn').addEventListener('click', () => {
            this.saveToInvoices();
        });

        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopCamera();
            } else {
                this.startCamera();
            }
        });
    }

    capturePhoto() {
        // Draw current video frame to canvas
        this.ctx.drawImage(this.videoElement, 0, 0, this.canvasElement.width, this.canvasElement.height);
        
        // Convert canvas to data URL
        this.capturedPhoto = this.canvasElement.toDataURL('image/jpeg', 0.8);
        
        // Display captured image in preview
        this.capturedImage.src = this.capturedPhoto;
        
        // Switch to preview section
        this.showSection('previewSection');
        
        // Stop camera to save battery
        this.stopCamera();
    }

    retakePhoto() {
        // Switch back to camera section
        this.showSection('cameraSection');
        
        // Restart camera
        this.startCamera();
    }

    async processWithAI() {
        // Show processing section
        this.showSection('processingSection');
        
        // Simulate AI processing (in real app, this would call an API)
        setTimeout(() => {
            this.showResults();
        }, 3000);
    }

    showResults() {
        // For demo purposes, show mock extracted data
        this.populateMockData();
        
        // Show results section
        this.showSection('resultsSection');
    }

    populateMockData() {
        // Mock data for demonstration
        const mockData = {
            docType: 'Receipt',
            vendorName: 'ABC Electronics Store',
            totalAmount: '₹8,500.00',
            documentDate: 'March 15, 2024'
        };

        // Update UI with mock data
        document.getElementById('docType').textContent = mockData.docType;
        document.getElementById('vendorName').textContent = mockData.vendorName;
        document.getElementById('totalAmount').textContent = mockData.totalAmount;
        document.getElementById('documentDate').textContent = mockData.documentDate;
    }

    async switchCamera() {
        this.currentFacingMode = this.currentFacingMode === 'user' ? 'environment' : 'user';
        await this.startCamera();
    }

    // FIXED: Cancel scan function
    cancelScan() {
        // Stop camera first
        this.stopCamera();
        
        // Check if we're in camera mode or preview mode
        const cameraSection = document.getElementById('cameraSection');
        const previewSection = document.getElementById('previewSection');
        
        if (!cameraSection.classList.contains('hidden')) {
            // We're in camera mode - go back to previous page
            this.goBack();
        } else if (!previewSection.classList.contains('hidden')) {
            // We're in preview mode - go back to camera
            this.retakePhoto();
        } else {
            // We're in processing or results - go back to camera
            this.showSection('cameraSection');
            this.startCamera();
        }
    }

    // New method to handle navigation back
    goBack() {
        // Try to go back in history, if not possible go to dashboard
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = 'dashboard.html';
        }
    }

    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
    }

    showSection(sectionId) {
        // Hide all sections
        document.getElementById('cameraSection').classList.add('hidden');
        document.getElementById('previewSection').classList.add('hidden');
        document.getElementById('processingSection').classList.add('hidden');
        document.getElementById('resultsSection').classList.add('hidden');
        
        // Show target section
        document.getElementById(sectionId).classList.remove('hidden');
    }

    saveImage() {
        if (!this.capturedPhoto) return;

        // Create a temporary link to download the image
        const link = document.createElement('a');
        link.download = `document-scan-${new Date().getTime()}.jpg`;
        link.href = this.capturedPhoto;
        link.click();
        
        alert('Image saved successfully!');
    }

    newScan() {
        // Reset to camera section
        this.showSection('cameraSection');
        
        // Restart camera
        this.startCamera();
    }

    createExpense() {
        alert('Creating expense from scanned document...\n\nIn a real application, this would open the expense creation form with pre-filled data.');
        
        // Navigate to new transaction page with expense type
        setTimeout(() => {
            window.location.href = 'new-transaction.html';
        }, 1000);
    }

    saveToInvoices() {
        alert('Saving to invoices...\n\nIn a real application, this would create a new invoice with the extracted data.');
        
        // Navigate to invoices page
        setTimeout(() => {
            window.location.href = 'invoices.html';
        }, 1000);
    }

    handleCameraError(error) {
        console.error('Camera error:', error);
        
        let errorMessage = 'Unable to access camera. ';
        
        if (error.name === 'NotAllowedError') {
            errorMessage += 'Please allow camera access and refresh the page.';
        } else if (error.name === 'NotFoundError') {
            errorMessage += 'No camera found on your device.';
        } else if (error.name === 'NotSupportedError') {
            errorMessage += 'Your browser does not support camera access.';
        } else {
            errorMessage += `Error: ${error.message}`;
        }
        
        alert(errorMessage);
        
        // Show fallback image upload option
        this.showImageUploadFallback();
    }

    showImageUploadFallback() {
        const cameraSection = document.getElementById('cameraSection');
        cameraSection.innerHTML = `
            <div class="upload-fallback">
                <div class="upload-icon">
                    <i class="fas fa-cloud-upload-alt"></i>
                </div>
                <h3>Camera Not Available</h3>
                <p>You can upload an image file instead:</p>
                <input type="file" id="fileUpload" accept="image/*" style="display: none;">
                <button class="upload-btn" onclick="document.getElementById('fileUpload').click()">
                    <i class="fas fa-upload"></i> Choose Image File
                </button>
                <button class="camera-btn cancel-btn" id="uploadCancelBtn">
                    <i class="fas fa-times"></i> Cancel
                </button>
            </div>
        `;

        // Handle file upload
        document.getElementById('fileUpload').addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                this.handleFileUpload(file);
            }
        });

        // Handle cancel button in upload fallback
        document.getElementById('uploadCancelBtn').addEventListener('click', () => {
            this.cancelScan();
        });
    }

    handleFileUpload(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            this.capturedPhoto = e.target.result;
            this.capturedImage.src = this.capturedPhoto;
            this.showSection('previewSection');
        };
        
        reader.readAsDataURL(file);
    }

    // Clean up when leaving page
    destroy() {
        this.stopCamera();
    }
}

// Initialize scanner when page loads
let scanner;

document.addEventListener('DOMContentLoaded', function() {
    scanner = new DocumentScanner();
});

// Clean up when leaving page
window.addEventListener('beforeunload', function() {
    if (scanner) {
        scanner.destroy();
    }
});

// Also handle page unload
window.addEventListener('unload', function() {
    if (scanner) {
        scanner.destroy();
    }
});