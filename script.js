
let currentPage = 1;
const rowsPerPage = 10;
let currentSort = { field: null, ascending: true };
let filteredData = [];
let originalData = []; 


async function fetchData() {
    try {
        const response = await fetch('data/applicants_data.json');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    try {
        originalData = await fetchData();
        filteredData = [...originalData]; 
        
        initializeTable();
    } catch (error) {
        console.error('Error initializing application:', error);
        document.querySelector('#licenseTable tbody').innerHTML = 
            '<tr><td colspan="7" style="text-align: center;">Error loading data. Please try again later.</td></tr>';
    }
});

// Initialize table and set up event handlers
function initializeTable() {
    renderTable();
    
    // Set up event listeners for sorting
    document.querySelectorAll('th[data-sort]').forEach(th => {
        th.addEventListener('click', () => {
            const field = th.getAttribute('data-sort');
            sortTable(field);
        });
    });
    
    // Set up event listeners for search and filters
    document.getElementById('searchInput').addEventListener('input', filterTable);
    document.getElementById('licenseTypeFilter').addEventListener('change', filterTable);
    
    // Set up pagination
    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
        }
    });
    
    document.getElementById('nextPage').addEventListener('click', () => {
        const maxPage = Math.ceil(filteredData.length / rowsPerPage);
        if (currentPage < maxPage) {
            currentPage++;
            renderTable();
        }
    });
}

// Sort table based on column
function sortTable(field) {
    // Update sort direction
    if (currentSort.field === field) {
        currentSort.ascending = !currentSort.ascending;
    } else {
        currentSort.field = field;
        currentSort.ascending = true;
    }
    
    filteredData.sort((a, b) => {
        let valA = a[field] || '';
        let valB = b[field] || '';
        
        // Convert to numbers for numerical comparison if possible
        if (!isNaN(valA) && !isNaN(valB)) {
            valA = Number(valA);
            valB = Number(valB);
        }
        
        if (valA < valB) return currentSort.ascending ? -1 : 1;
        if (valA > valB) return currentSort.ascending ? 1 : -1;
        return 0;
    });
    
    currentPage = 1;
    renderTable();
}

// Filter table based on search input and dropdowns
function filterTable() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const licenseType = document.getElementById('licenseTypeFilter').value;
    
    filteredData = originalData.filter(item => {
        // Search term filter
        const matchesSearch = 
            (item.business_name && item.business_name.toLowerCase().includes(searchTerm)) ||
            (item.dba_name && item.dba_name.toLowerCase().includes(searchTerm)) ||
            (item.address && item.address.toLowerCase().includes(searchTerm)) ||
            (item.zipcode && item.zipcode.toLowerCase().includes(searchTerm)) ||
            (item.license_number && item.license_number.toLowerCase().includes(searchTerm)) ||
            (item.alcohol_type && item.alcohol_type.toLowerCase().includes(searchTerm));
        
        
        // License type filter
        const matchesLicenseType = !licenseType || (item.alcohol_type === licenseType);
        
        return matchesSearch && matchesLicenseType;
    });
    
    // Reset to first page after filtering
    currentPage = 1;
    renderTable();
}

// Render the table with current filtered data
function renderTable() {
    const tableBody = document.querySelector('#licenseTable tbody');
    tableBody.innerHTML = '';
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, filteredData.length);
    const maxPage = Math.ceil(filteredData.length / rowsPerPage);
    
    
    // Enable/disable pagination buttons
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage >= maxPage;
    
    // No results case
    if (filteredData.length === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 7;
        cell.textContent = 'No matching licenses found';
        cell.style.textAlign = 'center';
        row.appendChild(cell);
        tableBody.appendChild(row);
        return;
    }
    
    // Populate table with current page data
    for (let i = startIndex; i < endIndex; i++) {
        const item = filteredData[i];
        const row = document.createElement('tr');
        
        // Business name
        const businessCell = document.createElement('td');
        businessCell.textContent = item.business_name || '-';
        row.appendChild(businessCell);
        
        // DBA name
        const dbaCell = document.createElement('td');
        dbaCell.textContent = item.dba_name || '-';
        row.appendChild(dbaCell);
        
        // Address
        const addressCell = document.createElement('td');
        addressCell.textContent = item.address || '-';
        row.appendChild(addressCell);
        
        // Zipcode
        const zipcodeCell = document.createElement('td');
        zipcodeCell.textContent = item.zipcode || '-';
        row.appendChild(zipcodeCell);
        
        // License number
        const licenseNumCell = document.createElement('td');
        licenseNumCell.textContent = item.license_number || '-';
        row.appendChild(licenseNumCell);
        
        // License type
        const licenseTypeCell = document.createElement('td');
        licenseTypeCell.textContent = item.alcohol_type || '-';
        row.appendChild(licenseTypeCell);
        
        // Source file
        const fileCell = document.createElement('td');
        fileCell.textContent = item.file_name || '-';
        row.appendChild(fileCell);
        
        tableBody.appendChild(row);
    }
}

