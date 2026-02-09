const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const promptInput = document.getElementById('promptInput');
const extractBtn = document.getElementById('extractBtn');
const loading = document.getElementById('loading');
const result = document.getElementById('result');
const fileInfo = document.getElementById('fileInfo');
const resultContent = document.getElementById('resultContent');

let selectedFile = null;

// Click to upload
uploadArea.addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput.click();
});

// File selection
fileInput.addEventListener('change', (e) => {
    handleFile(e.target.files[0]);
});

// Drag and drop
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    handleFile(e.dataTransfer.files[0]);
});

// Handle file selection
function handleFile(file) {
    if (!file) return;

    if (file.type !== 'application/pdf') {
        alert('Please upload a PDF file');
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
    }

    selectedFile = file;
    uploadArea.innerHTML = `
        <div class="upload-icon">✅</div>
        <h3>${file.name}</h3>
        <p>${(file.size / 1024 / 1024).toFixed(2)} MB</p>
    `;
    extractBtn.disabled = false;
    result.style.display = 'none';
}

// Extract information
extractBtn.addEventListener('click', async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('pdf', selectedFile);
    formData.append('prompt', promptInput.value || 'Extract and summarize all key information from this document');

    extractBtn.disabled = true;
    loading.style.display = 'block';
    result.style.display = 'none';

    try {
        const response = await fetch('http://localhost:3000/extract', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            fileInfo.innerHTML = `
                <strong>File:</strong> ${data.filename} | 
                <strong>Pages:</strong> ${data.pageCount}
            `;
            resultContent.textContent = data.extractedInfo;
            result.classList.remove('error');
            result.style.display = 'block';
        } else {
            throw new Error(data.error || 'Extraction failed');
        }
    } catch (error) {
        fileInfo.innerHTML = '';
        resultContent.textContent = `Error: ${error.message}`;
        result.classList.add('error');
        result.style.display = 'block';
    } finally {
        loading.style.display = 'none';
        extractBtn.disabled = false;
    }
});
