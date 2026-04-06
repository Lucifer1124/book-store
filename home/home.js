// Books database
let booksDatabase = JSON.parse(localStorage.getItem('books')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let currentBookId = null;
let currentPdfDoc = null;
let currentPage = 1;
let zoomLevel = 1.0;

const categories = ['Action', 'Drama', 'Romance', 'Sci-Fi', 'Fantasy', 'Gore', 'Adventure', 'Crime', 'Thriller', 'Heartbreak'];
const MAX_BOOK_FILE_SIZE = 20 * 1024 * 1024; // 10MB in bytes
const MAX_IMAGE_FILE_SIZE = 15 * 1024 * 1024; // 5MB in bytes

let uploadBtn, userProfile, authButtons, usernameDisplay, logoutBtn;
let uploadModal, readerModal, paymentModal;
let uploadForm, searchInput, categoryFilter, booksGrid, noResults, paymentForm;
let clearSearchBtn, categoryFilterBtns;

document.addEventListener('DOMContentLoaded', function () {
    console.log('Initializing Bookie Pookie...');
    initElements();
    checkAuth();
    setupEventListeners();
    loadBooks();
    populateCategoryFilter();

    if (booksDatabase.length === 0) {
        addSampleBooks();
    }
});

function initElements() {
    uploadBtn = document.getElementById('uploadBtn');
    userProfile = document.getElementById('userProfile');
    authButtons = document.getElementById('authButtons');
    usernameDisplay = document.getElementById('usernameDisplay');
    logoutBtn = document.getElementById('logoutBtn');
    uploadForm = document.getElementById('uploadForm');
    searchInput = document.getElementById('searchInput');
    categoryFilter = document.getElementById('categoryFilter');
    booksGrid = document.getElementById('booksGrid');
    noResults = document.getElementById('noResults');
    paymentForm = document.getElementById('paymentForm');
    clearSearchBtn = document.getElementById('clearSearch');
    categoryFilterBtns = document.querySelectorAll('.category-filter-btn');

    if (document.getElementById('uploadModal')) {
        uploadModal = new bootstrap.Modal(document.getElementById('uploadModal'));
    }
    if (document.getElementById('readerModal')) {
        readerModal = new bootstrap.Modal(document.getElementById('readerModal'));
    }
    if (document.getElementById('paymentModal')) {
        paymentModal = new bootstrap.Modal(document.getElementById('paymentModal'));
    }
}

function checkAuth() {
    currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        userProfile.classList.remove('d-none');
        if (authButtons) authButtons.classList.add('d-none');
        usernameDisplay.textContent = currentUser.username || currentUser.email || currentUser.firstname || 'User';
    } else {
        userProfile.classList.add('d-none');
        if (authButtons) authButtons.classList.remove('d-none');
    }
}

function populateCategoryFilter() {
    categoryFilter.innerHTML = '<option value="">All Categories</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

function addSampleBooks() {
    const sampleBooks = [
        {
            id: 1,
            title: "The Great Adventure",
            author: "John Explorer",
            category: "Adventure",
            priceType: "free",
            price: 0,
            cover: "https://via.placeholder.com/300x200/8672FF/FFFFFF?text=Adventure+Book",
            description: "An epic journey through uncharted lands.",
            uploadedBy: "admin",
            uploadDate: new Date().toLocaleDateString(),
            fileSize: "2.1 MB",
            fileType: "PDF"
        },
        {
            id: 2,
            title: "Romantic Nights",
            author: "Jane Romance",
            category: "Romance",
            priceType: "paid",
            price: 4.99,
            cover: "https://via.placeholder.com/300x200/FF6B8B/FFFFFF?text=Romance+Book",
            description: "A heartwarming love story that will make you believe in true love.",
            uploadedBy: "admin",
            uploadDate: new Date().toLocaleDateString(),
            fileSize: "1.5 MB",
            fileType: "PDF"
        },
        {
            id: 3,
            title: "Sci-Fi Chronicles",
            author: "Alex Future",
            category: "Sci-Fi",
            priceType: "free",
            price: 0,
            cover: "https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=Sci-Fi+Book",
            description: "Explore the future of humanity in distant galaxies.",
            uploadedBy: "admin",
            uploadDate: new Date().toLocaleDateString(),
            fileSize: "3.2 MB",
            fileType: "PDF"
        }
    ];

    booksDatabase = sampleBooks;
    localStorage.setItem('books', JSON.stringify(booksDatabase));
    loadBooks();
}

function setupEventListeners() {
    // Upload button
    if (uploadBtn) {
        uploadBtn.addEventListener('click', function (e) {
            e.preventDefault();
            if (!currentUser) {
                showToast('Please login to upload books', 'warning');
                window.location.href = '../auth/login.html';
                return;
            }
            if (uploadModal) {
                uploadModal.show();
            }
        });
    }

    //logout buttonn
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            localStorage.removeItem('currentUser');
            currentUser = null;
            checkAuth();
            showToast('Logged out successfully!', 'success');
            window.location.reload();
        });
    }

    //price toggle
    document.querySelectorAll('input[name="priceType"]').forEach(radio => {
        radio.addEventListener('change', function (e) {
            const priceInput = document.getElementById('priceInput');
            if (e.target.value === 'paid') {
                priceInput.style.display = 'block';
                document.getElementById('price').required = true;
            } else {
                priceInput.style.display = 'none';
                document.getElementById('price').required = false;
            }
        });
    });

    //file size val
    const bookFileInput = document.getElementById('bookFile');
    if (bookFileInput) {
        bookFileInput.addEventListener('change', function () {
            const file = this.files[0];
            const warningDiv = document.getElementById('fileSizeWarning');
            const uploadSubmitBtn = document.getElementById('uploadSubmitBtn');

            if (file) {
                if (file.size > MAX_BOOK_FILE_SIZE) {
                    warningDiv.textContent = `Book file size (${formatFileSize(file.size)}) exceeds 10MB limit!`;
                    warningDiv.classList.remove('d-none');
                    warningDiv.classList.add('text-danger');
                    if (uploadSubmitBtn) uploadSubmitBtn.disabled = true;
                } else {
                    warningDiv.textContent = `File size: ${formatFileSize(file.size)} (within limit)`;
                    warningDiv.classList.remove('d-none');
                    warningDiv.classList.remove('text-danger');
                    warningDiv.classList.add('text-success');
                    if (uploadSubmitBtn) uploadSubmitBtn.disabled = false;
                }
            }
        });
    }

    //image size val
    const coverImageInput = document.getElementById('coverImage');
    if (coverImageInput) {
        coverImageInput.addEventListener('change', function () {
            const file = this.files[0];
            const warningDiv = document.getElementById('coverImageSizeWarning');
            const uploadSubmitBtn = document.getElementById('uploadSubmitBtn');

            if (file) {
                if (file.size > MAX_IMAGE_FILE_SIZE) {
                    warningDiv.textContent = `Cover image size (${formatFileSize(file.size)}) exceeds 5MB limit!`;
                    warningDiv.classList.remove('d-none');
                    warningDiv.classList.add('text-danger');
                    if (uploadSubmitBtn) uploadSubmitBtn.disabled = true;
                } else {
                    warningDiv.textContent = `Image size: ${formatFileSize(file.size)} (within limit)`;
                    warningDiv.classList.remove('d-none');
                    warningDiv.classList.remove('text-danger');
                    warningDiv.classList.add('text-success');
                    if (uploadSubmitBtn) uploadSubmitBtn.disabled = false;
                }
            }
        });
    }

    //upload form
    if (uploadForm) {
        uploadForm.addEventListener('submit', handleUpload);

        //eventlsitener for enter key
        uploadForm.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                //check if all enterd first
                const title = document.getElementById('title').value.trim();
                const author = document.getElementById('author').value.trim();
                const category = document.getElementById('category').value;
                const bookFile = document.getElementById('bookFile').files[0];
                const coverImage = document.getElementById('coverImage').files[0];

                if (title && author && category && bookFile && coverImage) {
                   
                    if (!uploadForm.checkValidity()) {
                    
                        uploadForm.reportValidity();
                    } else {
                        handleUpload(e);
                    }
                } else {
                    showToast('Please fill all required fields before submitting', 'warning');
                }
            }
        });
    }

    //search input
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            filterBooks();
            //update clear button
            if (this.value.trim()) {
                clearSearchBtn.style.visibility = 'visible';
            } else {
                clearSearchBtn.style.visibility = 'hidden';
            }
        });
    }

    //clear search button
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', function () {
            searchInput.value = '';
            filterBooks();
            this.style.visibility = 'hidden';
        });
    }

    //category filter
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterBooks);
    }

    //category dropdown items
    document.querySelectorAll('.category-filter').forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            const category = this.getAttribute('data-category');
            if (categoryFilter) {
                categoryFilter.value = category;
                filterBooks();
            }
        });
    });

    //category filter buttons
    if (categoryFilterBtns) {
        categoryFilterBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                const category = this.getAttribute('data-category');
                categoryFilter.value = category;
                filterBooks();

                //update state
                categoryFilterBtns.forEach(b => b.classList.remove('category-active'));
                this.classList.add('category-active');
            });
        });
    }

    //pay form previeq
    if (paymentForm) {
        paymentForm.addEventListener('submit', handlePayment);
    }

    //PDF controls
    document.getElementById('prevPage')?.addEventListener('click', prevPage);
    document.getElementById('nextPage')?.addEventListener('click', nextPage);
    document.getElementById('zoomIn')?.addEventListener('click', zoomIn);
    document.getElementById('zoomOut')?.addEventListener('click', zoomOut);
}

function handleUpload(e) {
    e.preventDefault();
    console.log('Upload form submitted');

    const title = document.getElementById('title').value.trim();
    const author = document.getElementById('author').value.trim();
    const category = document.getElementById('category').value;
    const priceType = document.querySelector('input[name="priceType"]:checked').value;
    const price = priceType === 'paid' ? parseFloat(document.getElementById('price').value) || 0 : 0;
    const bookFile = document.getElementById('bookFile').files[0];
    const coverImage = document.getElementById('coverImage').files[0];
    const uploadSubmitBtn = document.getElementById('uploadSubmitBtn');

    //val
    if (!title || !author || !category || !bookFile || !coverImage) {
        showToast('Please fill all required fields', 'error');

        //highlight empty fields
        if (!title) document.getElementById('title').classList.add('is-invalid');
        if (!author) document.getElementById('author').classList.add('is-invalid');
        if (!category) document.getElementById('category').classList.add('is-invalid');
        if (!bookFile) document.getElementById('bookFile').classList.add('is-invalid');
        if (!coverImage) document.getElementById('coverImage').classList.add('is-invalid');

        return;
    }

    //remove invalid classes
    document.getElementById('title').classList.remove('is-invalid');
    document.getElementById('author').classList.remove('is-invalid');
    document.getElementById('category').classList.remove('is-invalid');
    document.getElementById('bookFile').classList.remove('is-invalid');
    document.getElementById('coverImage').classList.remove('is-invalid');

    if (priceType === 'paid' && (!price || price <= 0)) {
        showToast('Please enter a valid price', 'error');
        document.getElementById('price').classList.add('is-invalid');
        return;
    }

    //file size validation
    if (bookFile.size > MAX_BOOK_FILE_SIZE) {
        showToast(`Book file size exceeds 10MB limit! Current: ${formatFileSize(bookFile.size)}`, 'error');
        document.getElementById('bookFile').classList.add('is-invalid');
        return;
    }

    if (coverImage.size > MAX_IMAGE_FILE_SIZE) {
        showToast(`Cover image size exceeds 5MB limit! Current: ${formatFileSize(coverImage.size)}`, 'error');
        document.getElementById('coverImage').classList.add('is-invalid');
        return;
    }

    //disable submit button to prevent multiple clicks
    if (uploadSubmitBtn) {
        uploadSubmitBtn.disabled = true;
        uploadSubmitBtn.innerHTML = '<i class="bi bi-upload me-2"></i>Uploading...';
    }

    // Read files
    const fileReader = new FileReader();
    const imageReader = new FileReader();

    fileReader.onload = function (fileEvent) {
        const bookFileContent = fileEvent.target.result;

        imageReader.onload = function (imageEvent) {
            const coverImageContent = imageEvent.target.result;

            try {
                //ereate book object with file content
                const book = {
                    id: Date.now(),
                    title: title,
                    author: author,
                    category: category,
                    priceType: priceType,
                    price: price,
                    cover: coverImageContent, 
                    bookFile: bookFileContent,
                    fileName: bookFile.name,
                    fileType: bookFile.type,
                    fileSize: formatFileSize(bookFile.size),
                    uploadedBy: currentUser ? (currentUser.username || currentUser.email || currentUser.firstname) : 'Anonymous',
                    uploadDate: new Date().toLocaleDateString(),
                    uploadTime: new Date().toLocaleTimeString(),
                    isFree: priceType === 'free'
                };

                //add at index local db
                booksDatabase.push(book);
                localStorage.setItem('books', JSON.stringify(booksDatabase));

                //reset form
                uploadForm.reset();
                document.getElementById('priceInput').style.display = 'none';
                document.getElementById('fileSizeWarning').classList.add('d-none');
                document.getElementById('coverImageSizeWarning').classList.add('d-none');

                if (uploadSubmitBtn) {
                    uploadSubmitBtn.disabled = false;
                    uploadSubmitBtn.innerHTML = '<i class="bi bi-upload me-2"></i>Upload Book';
                }

                if (uploadModal) {
                    uploadModal.hide();
                }

                //success message and reload books
                showToast('Book uploaded successfully!', 'success');
                loadBooks();

            } catch (error) {
                console.error('Error uploading book:', error);
                showToast('Error uploading book. Please try again.', 'error');

                if (uploadSubmitBtn) {
                    uploadSubmitBtn.disabled = false;
                    uploadSubmitBtn.innerHTML = '<i class="bi bi-upload me-2"></i>Upload Book';
                }
            }
        };

        imageReader.onerror = function () {
            showToast('Error reading cover image. Please try again.', 'error');
            if (uploadSubmitBtn) {
                uploadSubmitBtn.disabled = false;
                uploadSubmitBtn.innerHTML = '<i class="bi bi-upload me-2"></i>Upload Book';
            }
        };

        imageReader.readAsDataURL(coverImage);
    };

    fileReader.onerror = function () {
        showToast('Error reading book file. Please try again.', 'error');
        if (uploadSubmitBtn) {
            uploadSubmitBtn.disabled = false;
            uploadSubmitBtn.innerHTML = '<i class="bi bi-upload me-2"></i>Upload Book';
        }
    };

    fileReader.readAsDataURL(bookFile);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function loadBooks() {
    booksDatabase = JSON.parse(localStorage.getItem('books')) || [];
    if (booksDatabase.length === 0) {
        noResults.classList.remove('d-none');
        booksGrid.innerHTML = '';
    } else {
        noResults.classList.add('d-none');
        displayBooks(booksDatabase);
    }
}

function displayBooks(books) {
    if (!booksGrid) return;

    booksGrid.innerHTML = '';

    if (books.length === 0) {
        noResults.classList.remove('d-none');
        return;
    }

    noResults.classList.add('d-none');

    books.forEach(book => {
        const col = document.createElement('div');
        col.className = 'col';

        //check if current user can delete this book
        const canDelete = currentUser &&
            (book.uploadedBy === (currentUser.username || currentUser.email || currentUser.firstname) ||
                currentUser.email === 'admin@example.com');

        const priceText = book.priceType === 'free' ?
            '<span class="badge bg-success">FREE</span>' :
            `<span class="text-accent fw-bold">$${book.price?.toFixed(2) || '0.00'}</span>`;

        col.innerHTML = `
            <div class="book-card h-100 d-flex flex-column position-relative">
                ${canDelete ? `
                    <div class="book-actions">
                        <button class="btn btn-danger btn-sm delete-btn" onclick="deleteBook(${book.id}, event)">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                ` : ''}
                
                <img src="${book.cover}" class="book-cover" alt="${book.title}" 
                     onerror="this.onerror=null; this.src='https://via.placeholder.com/300x200/8672FF/FFFFFF?text=${encodeURIComponent(book.title?.substring(0, 20) || 'Book')}'">
                
                <div class="p-3 d-flex flex-column flex-grow-1">
                    <h6 class="fw-bold mb-2" title="${book.title}">${book.title || 'Untitled'}</h6>
                    <p class="text-muted small mb-2">by ${book.author || 'Unknown'}</p>
                    
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <span class="category-badge">${book.category || 'Uncategorized'}</span>
                        <small class="text-muted">${book.fileSize || 'N/A'}</small>
                    </div>
                    
                    <div class="mt-auto">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            ${priceText}
                            <small class="text-muted">${book.fileType?.split('/')[1]?.toUpperCase() || 'FILE'}</small>
                        </div>
                        
                        <button class="btn ${book.priceType === 'free' ? 'btn-success' : 'btn-accent'} w-100" 
                                onclick="${book.priceType === 'free' ? `readBook(${book.id})` : `buyBook(${book.id})`}">
                            <i class="bi ${book.priceType === 'free' ? 'bi-eye' : 'bi-cart'} me-1"></i>
                            ${book.priceType === 'free' ? 'Read Now' : 'Buy Now'}
                        </button>
                        
                        <small class="text-muted d-block mt-2">
                            <i class="bi bi-person"></i> ${book.uploadedBy || 'Anonymous'}
                        </small>
                    </div>
                </div>
            </div>
        `;

        booksGrid.appendChild(col);
    });
}

function deleteBook(bookId, event) {
    event.stopPropagation(); //prevent triggering card click

    if (!confirm('Are you sure you want to delete this book? This action cannot be undone.')) {
        return;
    }

    const bookIndex = booksDatabase.findIndex(book => book.id === bookId);
    if (bookIndex !== -1) {
        booksDatabase.splice(bookIndex, 1);
        localStorage.setItem('books', JSON.stringify(booksDatabase));
        showToast('Book deleted successfully!', 'success');
        filterBooks(); //refresh the filtered view
    }
}

function filterBooks() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const selectedCategory = categoryFilter.value;

    console.log('Filtering books:', { searchTerm, selectedCategory });

    const filteredBooks = booksDatabase.filter(book => {
        //look for search term
        const matchesSearch = !searchTerm ||
            (book.title && book.title.toLowerCase().includes(searchTerm)) ||
            (book.author && book.author.toLowerCase().includes(searchTerm));

        //category
        const matchesCategory = !selectedCategory || book.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    console.log('Filtered books count:', filteredBooks.length);
    displayBooks(filteredBooks);
}

async function readBook(bookId) {
    if (!currentUser) {
        showToast('Please login to read books', 'warning');
        window.location.href = '../auth/login.html';
        return;
    }

    const book = booksDatabase.find(b => b.id === bookId);
    if (!book) {
        showToast('Book not found', 'error');
        return;
    }

    //set book info in reader modal
    document.getElementById('readerTitle').textContent = book.title || 'Untitled';
    document.getElementById('fileName').textContent = book.fileName || 'Unknown';
    document.getElementById('fileSize').textContent = book.fileSize || 'Unknown';
    document.getElementById('fileType').textContent = book.fileType || 'Unknown';

    //hide all viewers first
    document.getElementById('pdfViewerContainer').classList.add('d-none');
    document.getElementById('textViewer').classList.add('d-none');
    document.getElementById('docxViewer').classList.add('d-none');

    if (book.bookFile) {
        if (book.fileType === 'application/pdf') {
            //show PDF viewer
            document.getElementById('pdfViewerContainer').classList.remove('d-none');
            await renderPDF(book.bookFile);
        } else if (book.fileType === 'text/plain' || book.fileName?.endsWith('.txt')) {
            //show text viewer
            document.getElementById('textViewer').classList.remove('d-none');
            const textContent = atob(book.bookFile.split(',')[1]);
            document.getElementById('textContent').textContent = textContent;
        } else if (book.fileType === book.fileName?.endsWith('.docx')){
            //show DOCX viewer
            document.getElementById('docxViewer').classList.remove('d-none');
            const downloadLink = document.getElementById('downloadLink');
            downloadLink.href = book.bookFile;
            downloadLink.download = book.fileName;
        } else {
            // For other file types, show download option
            document.getElementById('textViewer').classList.remove('d-none');
            document.getElementById('textContent').textContent =
                `This file type (${book.fileType}) cannot be previewed. Please download the file to view it.`;
        }
    } else {
        showToast('No file content available', 'warning');
    }

    if (readerModal) {
        readerModal.show();
    }
}

async function renderPDF(pdfDataUrl) {
    try {
        //reset PDF state
        currentPdfDoc = null;
        currentPage = 1;
        zoomLevel = 1.0;

        //open the PDF
        const pdfData = pdfDataUrl.split(',')[1];
        const binary = atob(pdfData);
        const array = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            array[i] = binary.charCodeAt(i);
        }

        //PDF.js to render
        const loadingTask = pdfjsLib.getDocument({ data: array });
        currentPdfDoc = await loadingTask.promise;

        //update page count
        document.getElementById('pageCount').textContent = currentPdfDoc.numPages;
        document.getElementById('pageNum').textContent = currentPage;
        document.getElementById('zoomLevel').textContent = Math.round(zoomLevel * 100);

        //render first page
        await renderPage(currentPage);

    } catch (error) {
        console.error('Error rendering PDF:', error);
        document.querySelector('.pdf-page-info').innerHTML =
            '<div class="alert alert-danger">Error loading PDF preview. Please download the file to view it.</div>';
    }
}

async function renderPage(pageNum) {
    if (!currentPdfDoc) return;

    const page = await currentPdfDoc.getPage(pageNum);
    const canvas = document.getElementById('pdfCanvas');
    const ctx = canvas.getContext('2d');

    //set canvas dimensions
    const viewport = page.getViewport({ scale: zoomLevel });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    //render PDF page
    const renderContext = {
        canvasContext: ctx,
        viewport: viewport
    };

    await page.render(renderContext).promise;

    //update page info
    document.getElementById('pageNum').textContent = pageNum;
}

function prevPage() {
    if (currentPdfDoc && currentPage > 1) {
        currentPage--;
        renderPage(currentPage);
    }
}

function nextPage() {
    if (currentPdfDoc && currentPage < currentPdfDoc.numPages) {
        currentPage++;
        renderPage(currentPage);
    }
}

function zoomIn() {
    if (zoomLevel < 2.0) {
        zoomLevel += 0.1;
        document.getElementById('zoomLevel').textContent = Math.round(zoomLevel * 100);
        renderPage(currentPage);
    }
}

function zoomOut() {
    if (zoomLevel > 0.5) {
        zoomLevel -= 0.1;
        document.getElementById('zoomLevel').textContent = Math.round(zoomLevel * 100);
        renderPage(currentPage);
    }
}

function buyBook(bookId) {
    if (!currentUser) {
        showToast('Please login to purchase books', 'warning');
        window.location.href = '../auth/login.html';
        return;
    }

    const book = booksDatabase.find(b => b.id === bookId);
    if (!book) {
        showToast('Book not found', 'error');
        return;
    }

    currentBookId = bookId;
    document.getElementById('paymentBookTitle').textContent = book.title || 'Untitled';
    document.getElementById('paymentBookAuthor').textContent = `by ${book.author || 'Unknown'}`;
    document.getElementById('paymentBookPrice').textContent = `$${book.price?.toFixed(2) || '0.00'}`;

    if (paymentModal) {
        paymentModal.show();
    }
}

function handlePayment(e) {
    e.preventDefault();

    //validate payment form
    const cardNumber = document.getElementById('cardNumber').value.trim();
    const expiry = document.getElementById('expiry').value.trim();
    const cvc = document.getElementById('cvc').value.trim();

    if (!cardNumber || !expiry || !cvc) {
        showToast('Please fill all payment details', 'error');
        return;
    }

    //simulate payment processing
    showToast('Processing payment...', 'info');

    setTimeout(() => {
        //add to user's purchases
        let purchases = JSON.parse(localStorage.getItem('purchases')) || [];
        const book = booksDatabase.find(b => b.id === currentBookId);

        if (book) {
            purchases.push({
                bookId: book.id,
                title: book.title,
                author: book.author,
                price: book.price,
                purchaseDate: new Date().toLocaleDateString(),
                transactionId: 'DEMO-' + Date.now()
            });

            localStorage.setItem('purchases', JSON.stringify(purchases));
        }

        if (paymentModal) {
            paymentModal.hide();
        }

        if (paymentForm) {
            paymentForm.reset();
        }

        showToast('Payment successful! Book added to your library.', 'success');

        //auto-open the reader after purchase
        setTimeout(() => readBook(currentBookId), 1000);
    }, 1500);
}

function showToast(message, type = 'info') {
    //remove existing toasts
    const existingToasts = document.querySelector('.toast-container');
    if (existingToasts) existingToasts.remove();

    const toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';

    const toastId = 'toast-' + Date.now();
    const icon = type === 'success' ? 'check-circle' :
        type === 'error' ? 'exclamation-circle' :
            type === 'warning' ? 'exclamation-triangle' : 'info-circle';

    const toastHtml = `
        <div id="${toastId}" class="toast align-items-center text-bg-${type} border-0" role="alert">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="bi bi-${icon} me-2"></i>${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;

    toastContainer.innerHTML = toastHtml;
    document.body.appendChild(toastContainer);

    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
    toast.show();

    //remove toast after it's hidden
    toastElement.addEventListener('hidden.bs.toast', function () {
        toastElement.remove();
    });
}

window.readBook = readBook;
window.buyBook = buyBook;
window.deleteBook = deleteBook;
window.prevPage = prevPage;
window.nextPage = nextPage;
window.zoomIn = zoomIn;
window.zoomOut = zoomOut;