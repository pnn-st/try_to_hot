// Enhanced NU International Exchange System JavaScript
// Google Sheets Integration Version

// Configuration - Replace with your Google Apps Script Web App URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwp-6lWqTpUsUJ5o374xyukoJKMpujdh8CGVN7TK8GUYkTPtWBlYpJA9qCpWllGysUo/exec';

// Initialize Lucide icons
function initializeIcons() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Load navigation component
function loadNavigation() {
    fetch('nav.html')
        .then(response => response.text())
        .then(data => {
            const navContainer = document.getElementById('nav-container');
            if (navContainer) {
                navContainer.innerHTML = data;
                initializeIcons();
                highlightCurrentPage();
            }
        })
        .catch(error => console.error('Error loading navigation:', error));
}

// Highlight current page in navigation
function highlightCurrentPage() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('bg-white/30');
            link.classList.remove('bg-white/10');
        }
    });
}

// Enhanced data management functions with Google Sheets
class ExchangeDataManager {
    static async loadData() {
        try {
            const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=loadData`);
            const result = await response.json();

            if (result.success) {
                return result.data;
            } else {
                console.error('Error loading data:', result.error);
                return [];
            }
        } catch (error) {
            console.error('Error loading data:', error);
            UIUtils.showNotification('Error loading data from server', 'error');
            return [];
        }
    }

    static async addRecord(record) {
        try {
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `action=addRecord&data=${encodeURIComponent(JSON.stringify(record))}`
            });

            const result = await response.json();
            return result.success;
        } catch (error) {
            console.error('Error adding record:', error);
            return false;
        }
    }

    static async updateRecord(index, record) {
        try {
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `action=updateRecord&index=${index}&data=${encodeURIComponent(JSON.stringify(record))}`
            });

            const result = await response.json();
            return result.success;
        } catch (error) {
            console.error('Error updating record:', error);
            return false;
        }
    }

    static async deleteRecord(index) {
        try {
            const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=deleteRecord&index=${index}`, {
                method: 'POST'
            });

            const result = await response.json();
            return result.success;
        } catch (error) {
            console.error('Error deleting record:', error);
            return false;
        }
    }
}

// Enhanced validation functions
class FormValidator {
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static validateDateRange(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return end > start;
    }

    static validateBudget(budget) {
        return !isNaN(budget) && parseFloat(budget) >= 0;
    }

    static validateRequired(value) {
        return value && value.trim().length > 0;
    }

    static validateForm(formData) {
        const errors = [];

        if (!this.validateRequired(formData.name)) {
            errors.push('Full name is required');
        }

        if (!this.validateRequired(formData.studentId)) {
            errors.push('Student ID is required');
        }

        if (!this.validateEmail(formData.email)) {
            errors.push('Valid email address is required');
        }

        if (!this.validateBudget(formData.budget)) {
            errors.push('Budget must be a valid positive number');
        }

        if (!this.validateDateRange(formData.fromdate, formData.todate)) {
            errors.push('End date must be after start date');
        }

        return errors;
    }
}

// Enhanced UI utilities
class UIUtils {
    static showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-all duration-300 ${type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
                'bg-blue-500 text-white'
            }`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    static showConfirmation(message, onConfirm, onCancel = null) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-backdrop';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 modal-content">
                <h3 class="text-xl font-bold text-gray-800 mb-4">Confirmation</h3>
                <p class="text-gray-600 mb-6">${message}</p>
                <div class="flex space-x-4 justify-end">
                    <button class="btn-secondary px-6 py-2" onclick="this.closest('.modal-backdrop').remove(); ${onCancel ? onCancel : ''}">Cancel</button>
                    <button class="btn-primary px-6 py-2" onclick="this.closest('.modal-backdrop').remove(); (${onConfirm})()">Confirm</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        return modal;
    }

    static formatCurrency(amount) {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB'
        }).format(amount);
    }

    static formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static showLoading(show = true) {
        let loader = document.getElementById('global-loader');

        if (show) {
            if (!loader) {
                loader = document.createElement('div');
                loader.id = 'global-loader';
                loader.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
                loader.innerHTML = `
                    <div class="bg-white rounded-2xl p-8 flex flex-col items-center">
                        <div class="animate-spin w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full mb-4"></div>
                        <p class="text-gray-700 font-semibold">Loading...</p>
                    </div>
                `;
                document.body.appendChild(loader);
            }
        } else {
            if (loader) {
                loader.remove();
            }
        }
    }
}

// Enhanced modal management
class ModalManager {
    static openModal(title, contentHtml) {
        const existingModal = document.getElementById('modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'modal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-backdrop';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden modal-content">
                <div class="gradient-bg text-white p-6">
                    <h2 class="text-2xl font-bold">${title}</h2>
                </div>
                <div class="p-6 overflow-y-auto max-h-96">${contentHtml}</div>
                <div class="p-6 bg-gray-50 flex justify-end space-x-4">
                    <button onclick="ModalManager.closeModal()" class="btn-secondary px-6 py-2">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        return modal;
    }

    static closeModal() {
        const modal = document.getElementById('modal');
        if (modal) {
            modal.style.opacity = '0';
            setTimeout(() => modal.remove(), 300);
        }
    }
}

// Enhanced table management
class TableManager {
    static async renderTable(containerId) {
        const tbody = document.getElementById(containerId);
        if (!tbody) return;

        UIUtils.showLoading(true);
        const data = await ExchangeDataManager.loadData();
        UIUtils.showLoading(false);

        tbody.innerHTML = data.map((row, index) => `
            <tr class="hover:bg-gray-50 transition-colors table-row">
                <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-900">${row.name || ''}</td>
                <td class="px-6 py-4 whitespace-nowrap text-gray-600">${row.studentId || ''}</td>
                <td class="px-6 py-4 whitespace-nowrap text-gray-600">${row.email || ''}</td>
                <td class="px-6 py-4 whitespace-nowrap text-gray-600">${this.getMajorName(row.major)}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-3 py-1 text-xs font-medium rounded-full ${row.formType === 'inbound' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}">
                        ${row.formType || 'inbound'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center space-x-2">
                    <button onclick="TableManager.viewRecord(${index})" class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg transition-colors">View</button>
                    <button onclick="TableManager.editRecord(${index})" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg transition-colors">Edit</button>
                    <button onclick="TableManager.deleteRecord(${index})" class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg transition-colors">Delete</button>
                </td>
            </tr>
        `).join('');
    }

    static getMajorName(code) {
        const majors = {
            'ce': 'Civil Engineering',
            'ie': 'Industrial Engineering',
            'me': 'Mechanical Engineering',
            'ee': 'Electrical Engineering',
            'cpe': 'Computer Engineering',
            'envi': 'Environmental Engineering',
            'mate': 'Materials Engineering',
            'chem': 'Chemical Engineering',
            'iie': 'Intelligent Innovation Engineering'
        };
        return majors[code] || code;
    }

    static async viewRecord(index) {
        UIUtils.showLoading(true);
        const data = await ExchangeDataManager.loadData();
        UIUtils.showLoading(false);

        const record = data[index];
        if (!record) return;

        const details = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-4">
                    <h3 class="text-lg font-semibold text-gray-800 border-b pb-2">Personal Information</h3>
                    <div class="space-y-2">
                        <p><span class="font-medium text-gray-600">Name:</span> ${record.name}</p>
                        <p><span class="font-medium text-gray-600">Student ID:</span> ${record.studentId}</p>
                        <p><span class="font-medium text-gray-600">Email:</span> ${record.email}</p>
                        <p><span class="font-medium text-gray-600">Phone:</span> ${record.phone}</p>
                        <p><span class="font-medium text-gray-600">Passport:</span> ${record.passportNumber}</p>
                        <p><span class="font-medium text-gray-600">Residence:</span> ${record.residence}</p>
                    </div>
                </div>
                <div class="space-y-4">
                    <h3 class="text-lg font-semibold text-gray-800 border-b pb-2">Academic Information</h3>
                    <div class="space-y-2">
                        <p><span class="font-medium text-gray-600">Major:</span> ${this.getMajorName(record.major)}</p>
                        <p><span class="font-medium text-gray-600">Year:</span> ${record.year}</p>
                        <p><span class="font-medium text-gray-600">Adviser:</span> ${record.adviser}</p>
                        <p><span class="font-medium text-gray-600">Country:</span> ${record.country}</p>
                        <p><span class="font-medium text-gray-600">University:</span> ${record.university}</p>
                        <p><span class="font-medium text-gray-600">Type:</span> <span class="px-2 py-1 text-xs rounded-full ${record.formType === 'inbound' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}">${record.formType}</span></p>
                    </div>
                </div>
                <div class="col-span-1 md:col-span-2 space-y-4">
                    <h3 class="text-lg font-semibold text-gray-800 border-b pb-2">Project Information</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <p><span class="font-medium text-gray-600">Project:</span> ${record.project}</p>
                        <p><span class="font-medium text-gray-600">Funder:</span> ${record.funder}</p>
                        <p><span class="font-medium text-gray-600">Budget:</span> ${UIUtils.formatCurrency(record.budget)}</p>
                        <p><span class="font-medium text-gray-600">Duration:</span> ${UIUtils.formatDate(record.fromdate)} to ${UIUtils.formatDate(record.todate)}</p>
                    </div>
                    ${record.details ? `<div class="mt-4"><p><span class="font-medium text-gray-600">Additional Details:</span></p><p class="mt-2 p-4 bg-gray-50 rounded-lg">${record.details}</p></div>` : ''}
                </div>
            </div>
        `;

        ModalManager.openModal(`Student Details - ${record.name}`, details);
    }

    static editRecord(index) {
        console.log('Edit record:', index);
    }

    static async deleteRecord(index) {
        UIUtils.showLoading(true);
        const data = await ExchangeDataManager.loadData();
        UIUtils.showLoading(false);

        const record = data[index];
        if (!record) return;

        UIUtils.showConfirmation(
            `Are you sure you want to delete the record for ${record.name}? This action cannot be undone.`,
            async () => {
                UIUtils.showLoading(true);
                const success = await ExchangeDataManager.deleteRecord(index);
                UIUtils.showLoading(false);

                if (success) {
                    UIUtils.showNotification(`Record for ${record.name} has been deleted.`, 'success');
                    if (typeof refreshTable === 'function') {
                        refreshTable();
                    }
                } else {
                    UIUtils.showNotification('Error deleting record.', 'error');
                }
            }
        );
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function () {
    initializeIcons();
});