// Initialize sample books if database is empty
document.addEventListener('DOMContentLoaded', function () {
    const books = JSON.parse(localStorage.getItem('books')) || [];

    if (books.length === 0) {
        const sampleBooks = [
            {
                id: 1,
                title: "The Great Adventure",
                author: "John Doe",
                category: "Adventure",
                priceType: "free",
                price: 0,
                cover: "https://via.placeholder.com/300x200/8672FF/FFFFFF?text=Adventure+Book",
                uploadedBy: "admin",
                uploadDate: "2024-01-15",
                fileName: "sample.pdf",
                fileUrl: ""
            },
            {
                id: 2,
                title: "Romantic Nights",
                author: "Jane Smith",
                category: "Romance",
                priceType: "paid",
                price: 9.99,
                cover: "https://via.placeholder.com/300x200/FF6B8B/FFFFFF?text=Romance+Book",
                uploadedBy: "admin",
                uploadDate: "2024-01-16",
                fileName: "romance.pdf",
                fileUrl: ""
            },
            {
                id: 3,
                title: "Sci-Fi Chronicles",
                author: "Alex Johnson",
                category: "Sci-Fi",
                priceType: "free",
                price: 0,
                cover: "https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=Sci-Fi+Book",
                uploadedBy: "admin",
                uploadDate: "2024-01-17",
                fileName: "scifi.pdf",
                fileUrl: ""
            }
        ];

        localStorage.setItem('books', JSON.stringify(sampleBooks));
        console.log('Sample books added');
    }
});