// Кофейня "Миу-Миу"" - основной скрипт
document.addEventListener('DOMContentLoaded', function() {
    console.log('Кофейня "Миу-Миу" - инициализация...');
    
    // Инициализация всех модулей с безопасными проверками
    safeInitNavigation();
    safeInitSearch();
    safeInitCart();
    
    console.log('Кофейня "Миу-Миу"" - все модули инициализированы!');
});

// Безопасная инициализация навигации
function safeInitNavigation() {
    try {
        const navLinks = document.querySelectorAll('.nav-link');
        const menuSections = document.querySelectorAll('.menu-section');
        
        if (navLinks.length === 0) {
            console.log('Навигационные ссылки не найдены');
            return;
        }
        
        if (menuSections.length === 0) {
            console.log('Секции меню не найдены');
            return;
        }
        
        const header = document.querySelector('.header');
        const headerHeight = header ? header.offsetHeight : 80;
        
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Снимаем активный класс со всех ссылок
                navLinks.forEach(item => item.classList.remove('active'));
                
                // Добавляем активный класс к текущей ссылке
                this.classList.add('active');
                
                // Скрываем все секции
                menuSections.forEach(section => section.classList.remove('active'));
                
                // Показываем выбранную секцию
                const targetId = this.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    targetSection.classList.add('active');
                    
                    // Плавная прокрутка к секции
                    const targetPosition = targetSection.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: Math.max(0, targetPosition),
                        behavior: 'smooth'
                    });
                }
            });
        });
        
        console.log('Навигация инициализирована');
    } catch (error) {
        console.error('Ошибка в навигации:', error);
    }
}

// Безопасная инициализация поиска
function safeInitSearch() {
    try {
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-btn');
        
        // Если элементы поиска не существуют, выходим
        if (!searchInput || !searchBtn) {
            console.log('Элементы поиска не найдены, пропускаем инициализацию поиска');
            return;
        }
        
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        
        function performSearch() {
            const searchTerm = searchInput.value.toLowerCase().trim();
            
            if (searchTerm === '') {
                // Показываем все элементы при пустом поиске
                showAllItems();
                hideNoResultsMessage();
                return;
            }
            
            let foundItems = 0;
            
            // Ищем в лимитированных предложениях
            const offerItems = document.querySelectorAll('.offer-item');
            offerItems.forEach(item => {
                if (isItemMatchingSearch(item, searchTerm)) {
                    item.style.display = 'flex';
                    foundItems++;
                } else {
                    item.style.display = 'none';
                }
            });
            
            // Ищем в основном меню
            const menuItems = document.querySelectorAll('.menu-item');
            menuItems.forEach(item => {
                if (isItemMatchingSearch(item, searchTerm)) {
                    item.style.display = 'flex';
                    foundItems++;
                    activateCorrespondingSection(item);
                } else {
                    item.style.display = 'none';
                }
            });
            
            // Показываем сообщение если ничего не найдено
            if (foundItems === 0) {
                showNoResultsMessage(searchTerm);
            } else {
                hideNoResultsMessage();
            }
        }
        
        function isItemMatchingSearch(item, searchTerm) {
            const title = item.querySelector('h3')?.textContent.toLowerCase() || '';
            const description = item.querySelector('p')?.textContent.toLowerCase() || '';
            return title.includes(searchTerm) || description.includes(searchTerm);
        }
        
        function showAllItems() {
            document.querySelectorAll('.menu-item, .offer-item').forEach(item => {
                item.style.display = 'flex';
            });
        }
        
        function activateCorrespondingSection(menuItem) {
            const menuSection = menuItem.closest('.menu-section');
            if (menuSection) {
                const allSections = document.querySelectorAll('.menu-section');
                const allNavLinks = document.querySelectorAll('.nav-link');
                
                // Активируем секцию
                allSections.forEach(section => section.classList.remove('active'));
                menuSection.classList.add('active');
                
                // Активируем соответствующую вкладку
                allNavLinks.forEach(link => link.classList.remove('active'));
                const correspondingLink = document.querySelector(`.nav-link[href="#${menuSection.id}"]`);
                if (correspondingLink) {
                    correspondingLink.classList.add('active');
                }
            }
        }
        
        function showNoResultsMessage(searchTerm) {
            let messageElement = document.getElementById('search-no-results');
            if (!messageElement) {
                messageElement = document.createElement('div');
                messageElement.id = 'search-no-results';
                messageElement.style.cssText = `
                    text-align: center;
                    padding: 30px;
                    margin: 20px 0;
                    background: #fff8f0;
                    border-radius: 10px;
                    border: 2px dashed #d4a574;
                    color: #5c3d2e;
                `;
                
                const mainContent = document.querySelector('.main-content');
                if (mainContent) {
                    mainContent.prepend(messageElement);
                }
            }
            
            messageElement.innerHTML = `
                <h3 style="color: #8b5a2b; margin-bottom: 10px;">Ничего не найдено 😔</h3>
                <p>По запросу "<strong>${searchTerm}</strong>" ничего не найдено.</p>
                <p style="font-size: 0.9em; margin-top: 10px;">Попробуйте другие ключевые слова</p>
            `;
        }
        
        function hideNoResultsMessage() {
            const messageElement = document.getElementById('search-no-results');
            if (messageElement) {
                messageElement.remove();
            }
        }
        
        console.log('Поиск инициализирован');
    } catch (error) {
        console.error('Ошибка в поиске:', error);
    }
}

// Безопасная инициализация корзины
function safeInitCart() {
    try {
        const cart = {
            items: [],
            total: 0,
            
            init: function() {
                this.bindEvents();
                this.updateDisplay();
            },
            
            bindEvents: function() {
                // Кнопка переключения корзины
                const cartToggle = document.querySelector('.cart-toggle');
                if (cartToggle) {
                    cartToggle.addEventListener('click', () => this.toggleCart());
                }
                
                // Кнопка закрытия корзины
                const closeCart = document.querySelector('.close-cart');
                if (closeCart) {
                    closeCart.addEventListener('click', () => this.hideCart());
                }
                
                // Кнопки добавления в корзину
                const addButtons = document.querySelectorAll('.add-to-cart');
                addButtons.forEach(button => {
                    button.addEventListener('click', (e) => {
                        this.addItemFromButton(e.target);
                    });
                });
                
                // Кнопка оформления заказа
                const checkoutBtn = document.querySelector('.checkout-btn');
                if (checkoutBtn) {
                    checkoutBtn.addEventListener('click', () => this.checkout());
                }
                
                // Закрытие модального окна
                const closeThankYou = document.querySelector('.close-thank-you');
                if (closeThankYou) {
                    closeThankYou.addEventListener('click', () => this.hideThankYou());
                }
                
                // Закрытие по клику вне области
                document.addEventListener('click', (e) => {
                    const cartSidebar = document.querySelector('.cart-sidebar');
                    if (cartSidebar && cartSidebar.classList.contains('active') && 
                        !cartSidebar.contains(e.target) && 
                        !e.target.closest('.cart-toggle')) {
                        this.hideCart();
                    }
                });
                
                // Закрытие по Escape
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape') {
                        this.hideCart();
                        this.hideThankYou();
                    }
                });
            },
            
            addItemFromButton: function(button) {
                const itemElement = button.closest('.menu-item, .offer-item');
                if (!itemElement) return;
                
                const name = itemElement.querySelector('h3')?.textContent || 'Неизвестный товар';
                const priceText = itemElement.querySelector('.price')?.textContent || '0';
                const price = parseInt(priceText.replace(/\D/g, '')) || 0;
                
                this.addItem(name, price);
                this.animateAddToCart(button);
            },
            
            addItem: function(name, price) {
                const existingItem = this.items.find(item => item.name === name);
                
                if (existingItem) {
                    existingItem.quantity += 1;
                } else {
                    this.items.push({
                        name: name,
                        price: price,
                        quantity: 1
                    });
                }
                
                this.updateDisplay();
                this.showCart();
            },
            
            removeItem: function(name) {
                this.items = this.items.filter(item => item.name !== name);
                this.updateDisplay();
            },
            
            updateItemQuantity: function(name, change) {
                const item = this.items.find(item => item.name === name);
                if (item) {
                    item.quantity += change;
                    if (item.quantity <= 0) {
                        this.removeItem(name);
                    } else {
                        this.updateDisplay();
                    }
                }
            },
            
            calculateTotal: function() {
                this.total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                return this.total;
            },
            
            updateDisplay: function() {
                this.updateCartItems();
                this.updateCartTotal();
                this.updateCartCount();
            },
            
            updateCartItems: function() {
                const container = document.querySelector('.cart-items');
                if (!container) return;
                
                if (this.items.length === 0) {
                    container.innerHTML = `
                        <div class="empty-cart" style="text-align: center; padding: 40px; color: #7a6a5b;">
                            <p>🛒</p>
                            <p>Ваша корзина пуста</p>
                            <p style="font-size: 0.9em;">Добавьте товары из меню</p>
                        </div>
                    `;
                    return;
                }
                
                container.innerHTML = this.items.map(item => `
                    <div class="cart-item">
                        <div class="cart-item-info">
                            <h4>${item.name}</h4>
                            <span class="cart-item-price">${item.price} ₽</span>
                        </div>
                        <div class="cart-item-quantity">
                            <button class="quantity-btn minus" data-name="${item.name}">-</button>
                            <span class="item-quantity">${item.quantity}</span>
                            <button class="quantity-btn plus" data-name="${item.name}">+</button>
                        </div>
                    </div>
                `).join('');
                
                // Добавляем обработчики для кнопок количества
                container.querySelectorAll('.quantity-btn.minus').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const name = e.target.getAttribute('data-name');
                        this.updateItemQuantity(name, -1);
                    });
                });
                
                container.querySelectorAll('.quantity-btn.plus').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const name = e.target.getAttribute('data-name');
                        this.updateItemQuantity(name, 1);
                    });
                });
            },
            
            updateCartTotal: function() {
                const totalElement = document.getElementById('total-price');
                if (totalElement) {
                    totalElement.textContent = this.calculateTotal();
                }
            },
            
            updateCartCount: function() {
                const countElement = document.querySelector('.cart-count');
                if (countElement) {
                    const totalCount = this.items.reduce((sum, item) => sum + item.quantity, 0);
                    countElement.textContent = totalCount;
                    
                    // Анимация
                    countElement.style.transform = 'scale(1.3)';
                    setTimeout(() => {
                        countElement.style.transform = 'scale(1)';
                    }, 300);
                }
            },
            
            animateAddToCart: function(button) {
                const originalTransform = button.style.transform;
                const originalBg = button.style.backgroundColor;
                
                button.style.transform = 'scale(0.9)';
                button.style.backgroundColor = '#8b5a2b';
                
                setTimeout(() => {
                    button.style.transform = originalTransform;
                    button.style.backgroundColor = originalBg;
                }, 200);
            },
            
            toggleCart: function() {
                const sidebar = document.querySelector('.cart-sidebar');
                if (sidebar) {
                    sidebar.classList.toggle('active');
                }
            },
            
            showCart: function() {
                const sidebar = document.querySelector('.cart-sidebar');
                if (sidebar) {
                    sidebar.classList.add('active');
                }
            },
            
            hideCart: function() {
                const sidebar = document.querySelector('.cart-sidebar');
                if (sidebar) {
                    sidebar.classList.remove('active');
                }
            },
            
            checkout: function() {
                if (this.items.length === 0) {
                    this.showEmptyCartMessage();
                    return;
                }
                
                this.showThankYou();
                this.clearCart();
            },
            
            showEmptyCartMessage: function() {
                const checkoutBtn = document.querySelector('.checkout-btn');
                if (checkoutBtn) {
                    const originalText = checkoutBtn.textContent;
                    checkoutBtn.textContent = 'Корзина пуста!';
                    checkoutBtn.style.backgroundColor = '#ff6b6b';
                    
                    setTimeout(() => {
                        checkoutBtn.textContent = originalText;
                        checkoutBtn.style.backgroundColor = '';
                    }, 2000);
                }
            },
            
            showThankYou: function() {
                const modal = document.querySelector('.thank-you-modal');
                if (!modal) return;
                
                const orderDetails = this.items.map(item => 
                    `${item.name} x${item.quantity}`
                ).join(', ');
                
                const content = modal.querySelector('.thank-you-content');
                if (content) {
                    const messageElement = content.querySelector('p') || document.createElement('p');
                    messageElement.innerHTML = `
                        Спасибо за заказ!<br>
                        <strong>${orderDetails}</strong><br>
                        Общая сумма: ${this.total} ₽<br>
                        <small>Ожидайте приготовления</small>
                    `;
                    
                    if (!content.contains(messageElement)) {
                        content.appendChild(messageElement);
                    }
                }
                
                modal.classList.add('active');
            },
            
            hideThankYou: function() {
                const modal = document.querySelector('.thank-you-modal');
                if (modal) {
                    modal.classList.remove('active');
                }
            },
            
            clearCart: function() {
                this.items = [];
                this.updateDisplay();
                this.hideCart();
            }
        };
        
        cart.init();
        console.log('Корзина инициализирована');
    } catch (error) {
        console.error('Ошибка в корзине:', error);
    }
}

// Утилиты для работы с DOM
function safeQuerySelector(selector) {
    try {
        return document.querySelector(selector);
    } catch (error) {
        console.error(`Ошибка в селекторе: ${selector}`, error);
        return null;
    }
}

function safeQuerySelectorAll(selector) {
    try {
        return document.querySelectorAll(selector);
    } catch (error) {
        console.error(`Ошибка в селекторе: ${selector}`, error);
        return [];
    }
}


