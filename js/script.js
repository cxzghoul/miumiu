// Навигация по вкладкам с плавной прокруткой
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация всех компонентов
    initNavigation();
    initSearch();
    initCart();
    console.log('Кофейня "Аромат" - меню загружено!');
});

function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const menuSections = document.querySelectorAll('.menu-section');
    
    // Проверяем, есть ли элементы на странице
    if (navLinks.length === 0 || menuSections.length === 0) {
        console.warn('Навигационные элементы не найдены');
        return;
    }

    const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Убираем активный класс у всех ссылок
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
                
                // Плавная прокрутка к секции с учетом высоты шапки
                const targetPosition = targetSection.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

function initSearch() {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    
    // Проверяем, существуют ли элементы поиска
    if (!searchInput || !searchBtn) {
        console.warn('Элементы поиска не найдены');
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
            // Если поиск пустой, показываем все элементы
            document.querySelectorAll('.menu-item').forEach(item => {
                item.style.display = 'flex';
            });
            document.querySelectorAll('.offer-item').forEach(item => {
                item.style.display = 'flex';
            });
            hideNoResultsMessage();
            return;
        }
        
        let foundInOffers = false;
        let foundItems = 0;
        
        // Поиск в лимитированных предложениях
        document.querySelectorAll('.offer-item').forEach(item => {
            const title = item.querySelector('h3').textContent.toLowerCase();
            const description = item.querySelector('p').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || description.includes(searchTerm)) {
                item.style.display = 'flex';
                foundInOffers = true;
                foundItems++;
            } else {
                item.style.display = 'none';
            }
        });
        
        // Поиск в основном меню
        document.querySelectorAll('.menu-item').forEach(item => {
            const title = item.querySelector('h3').textContent.toLowerCase();
            const description = item.querySelector('p').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || description.includes(searchTerm)) {
                item.style.display = 'flex';
                foundItems++;
                
                // Показываем соответствующую секцию
                const menuSection = item.closest('.menu-section');
                if (menuSection) {
                    const menuSections = document.querySelectorAll('.menu-section');
                    const navLinks = document.querySelectorAll('.nav-link');
                    
                    menuSections.forEach(section => section.classList.remove('active'));
                    menuSection.classList.add('active');
                    
                    // Обновляем активную вкладку
                    navLinks.forEach(link => link.classList.remove('active'));
                    const correspondingLink = document.querySelector(`.nav-link[href="#${menuSection.id}"]`);
                    if (correspondingLink) {
                        correspondingLink.classList.add('active');
                    }
                }
            } else {
                item.style.display = 'none';
            }
        });
        
        // Если ничего не найдено, показываем сообщение
        if (foundItems === 0) {
            showNoResultsMessage(searchTerm);
        } else {
            hideNoResultsMessage();
        }
    }
    
    function showNoResultsMessage(searchTerm) {
        let noResultsMsg = document.getElementById('no-results-message');
        if (!noResultsMsg) {
            noResultsMsg = document.createElement('div');
            noResultsMsg.id = 'no-results-message';
            noResultsMsg.style.cssText = `
                text-align: center;
                padding: 40px;
                color: #7a6a5b;
                font-size: 1.2rem;
                background: #f9f5f0;
                border-radius: 10px;
                margin: 20px 0;
            `;
            const mainContent = document.querySelector('.main-content .container');
            if (mainContent) {
                mainContent.prepend(noResultsMsg);
            }
        }
        noResultsMsg.innerHTML = `
            <h3>Ничего не найдено</h3>
            <p>По запросу "<strong>${searchTerm}</strong>" ничего не найдено.</p>
            <p>Попробуйте изменить поисковый запрос.</p>
        `;
    }
    
    function hideNoResultsMessage() {
        const noResultsMsg = document.getElementById('no-results-message');
        if (noResultsMsg) {
            noResultsMsg.remove();
        }
    }
}

function initCart() {
    const cartToggle = document.querySelector('.cart-toggle');
    const cartSidebar = document.querySelector('.cart-sidebar');
    const closeCart = document.querySelector('.close-cart');
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    const cartItemsContainer = document.querySelector('.cart-items');
    const totalPriceElement = document.getElementById('total-price');
    const cartCount = document.querySelector('.cart-count');
    const checkoutBtn = document.querySelector('.checkout-btn');
    
    // Модальное окно благодарности
    const thankYouModal = document.querySelector('.thank-you-modal');
    const closeThankYou = document.querySelector('.close-thank-you');
    
    let cart = [];
    let totalPrice = 0;
    
    // Проверяем основные элементы корзины
    if (!cartToggle || !cartSidebar || !cartItemsContainer || !totalPriceElement || !cartCount) {
        console.warn('Некоторые элементы корзины не найдены');
        return;
    }
    
    // Открытие/закрытие корзины
    cartToggle.addEventListener('click', function() {
        cartSidebar.classList.add('active');
    });
    
    if (closeCart) {
        closeCart.addEventListener('click', function() {
            cartSidebar.classList.remove('active');
        });
    }
    
    // Закрытие модального окна благодарности
    if (closeThankYou && thankYouModal) {
        closeThankYou.addEventListener('click', function() {
            thankYouModal.classList.remove('active');
        });
        
        // Закрытие модального окна при клике вне его
        thankYouModal.addEventListener('click', function(e) {
            if (e.target === thankYouModal) {
                thankYouModal.classList.remove('active');
            }
        });
    }
    
    // Добавление товара в корзину
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            let itemName, itemPrice;
            
            // Проверяем, это лимитированное предложение или обычный товар
            const offerItem = this.closest('.offer-item');
            const menuItem = this.closest('.menu-item');
            
            if (offerItem) {
                // Для лимитированных предложений
                itemName = offerItem.querySelector('h3')?.textContent || 'Неизвестный товар';
                const priceText = offerItem.querySelector('.price')?.textContent || '0';
                itemPrice = parseInt(priceText) || 0;
            } else if (menuItem) {
                // Для обычных товаров меню
                itemName = menuItem.querySelector('h3')?.textContent || 'Неизвестный товар';
                const priceText = menuItem.querySelector('.price')?.textContent || '0';
                itemPrice = parseInt(priceText) || 0;
            } else {
                console.warn('Не удалось определить товар');
                return;
            }
            
            addToCart(itemName, itemPrice);
            
            // Анимация добавления в корзину
            animateAddToCart(this);
        });
    });
    
    function animateAddToCart(button) {
        const originalBg = button.style.backgroundColor;
        const originalColor = button.style.color;
        
        button.style.transform = 'scale(0.9)';
        button.style.backgroundColor = '#8b5a2b';
        button.style.color = '#fff';
        
        setTimeout(() => {
            button.style.transform = 'scale(1)';
            button.style.backgroundColor = originalBg;
            button.style.color = originalColor;
            
            if (button.classList.contains('limited')) {
                button.style.backgroundColor = '#d4a574';
                button.style.color = '#5c3d2e';
            }
        }, 200);
    }
    
    function addToCart(name, price) {
        // Проверяем, есть ли товар уже в корзине
        const existingItem = cart.find(item => item.name === name);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                name: name,
                price: price,
                quantity: 1
            });
        }
        
        updateCart();
        if (cartSidebar) {
            cartSidebar.classList.add('active');
        }
        
        // Анимация счетчика корзины
        animateCartCount();
    }
    
    function animateCartCount() {
        if (cartCount) {
            cartCount.style.transform = 'scale(1.5)';
            setTimeout(() => {
                cartCount.style.transform = 'scale(1)';
            }, 300);
        }
    }
    
    function updateCart() {
        // Очищаем контейнер корзины
        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = '';
        }
        
        // Сбрасываем общую стоимость
        totalPrice = 0;
        
        if (cart.length === 0) {
            // Показываем сообщение о пустой корзине
            if (cartItemsContainer) {
                cartItemsContainer.innerHTML = `
                    <div class="empty-cart-message" style="text-align: center; padding: 40px; color: #7a6a5b;">
                        <p>Ваша корзина пуста</p>
                        <p>Добавьте товары из меню</p>
                    </div>
                `;
            }
        } else {
            // Добавляем каждый товар в корзину
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                totalPrice += itemTotal;
                
                const cartItemElement = document.createElement('div');
                cartItemElement.classList.add('cart-item');
                cartItemElement.innerHTML = `
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <span class="cart-item-price">${item.price} ₽</span>
                    </div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn minus" data-name="${item.name}">-</button>
                        <span class="item-quantity">${item.quantity}</span>
                        <button class="quantity-btn plus" data-name="${item.name}">+</button>
                    </div>
                `;
                
                if (cartItemsContainer) {
                    cartItemsContainer.appendChild(cartItemElement);
                }
            });
        }
        
        // Обновляем общую стоимость и количество товаров
        if (totalPriceElement) {
            totalPriceElement.textContent = totalPrice;
        }
        if (cartCount) {
            cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
        }
        
        // Добавляем обработчики событий для кнопок изменения количества
        document.querySelectorAll('.quantity-btn.minus').forEach(button => {
            button.addEventListener('click', function() {
                const itemName = this.getAttribute('data-name');
                decreaseQuantity(itemName);
            });
        });
        
        document.querySelectorAll('.quantity-btn.plus').forEach(button => {
            button.addEventListener('click', function() {
                const itemName = this.getAttribute('data-name');
                increaseQuantity(itemName);
            });
        });
    }
    
    function decreaseQuantity(name) {
        const itemIndex = cart.findIndex(item => item.name === name);
        
        if (itemIndex !== -1) {
            if (cart[itemIndex].quantity > 1) {
                cart[itemIndex].quantity -= 1;
            } else {
                cart.splice(itemIndex, 1);
            }
            
            updateCart();
        }
    }
    
    function increaseQuantity(name) {
        const itemIndex = cart.findIndex(item => item.name === name);
        
        if (itemIndex !== -1) {
            cart[itemIndex].quantity += 1;
            updateCart();
        }
    }
    
    // Оформление заказа
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (cart.length === 0) {
                showEmptyCartMessage();
                return;
            }
            
            // Показываем модальное окно благодарности
            showThankYouModal();
            
            // Очищаем корзину после оформления заказа
            cart = [];
            updateCart();
            if (cartSidebar) {
                cartSidebar.classList.remove('active');
            }
        });
    }
    
    function showEmptyCartMessage() {
        if (checkoutBtn) {
            const originalText = checkoutBtn.textContent;
            const originalBg = checkoutBtn.style.backgroundColor;
            
            checkoutBtn.textContent = 'Корзина пуста!';
            checkoutBtn.style.backgroundColor = '#ff6b6b';
            
            setTimeout(() => {
                checkoutBtn.textContent = originalText;
                checkoutBtn.style.backgroundColor = originalBg;
            }, 2000);
        }
    }
    
    function showThankYouModal() {
        if (!thankYouModal) return;
        
        // Обновляем текст в модальном окне в зависимости от заказа
        const orderDetails = cart.map(item => 
            `${item.name} x${item.quantity}`
        ).join(', ');
        
        const thankYouText = thankYouModal.querySelector('.thank-you-content p');
        if (thankYouText) {
            thankYouText.innerHTML = `
                Ваш заказ: <strong>${orderDetails}</strong><br>
                Принят в обработку. Ожидайте приготовления.<br>
                <small>Общая сумма: ${totalPrice} ₽</small>
            `;
        }
        
        thankYouModal.classList.add('active');
    }
    
    // Закрытие корзины при клике вне ее
    document.addEventListener('click', function(e) {
        if (cartSidebar && cartSidebar.classList.contains('active') && 
            !cartSidebar.contains(e.target) && 
            cartToggle && !cartToggle.contains(e.target)) {
            cartSidebar.classList.remove('active');
        }
    });
    
    // Обработка клавиши Escape для закрытия корзины и модальных окон
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (cartSidebar) {
                cartSidebar.classList.remove('active');
            }
            if (thankYouModal) {
                thankYouModal.classList.remove('active');
            }
        }
    });
    
    // Инициализация корзины при загрузке
    updateCart();
}