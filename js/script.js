// Навигация по вкладкам
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    const menuSections = document.querySelectorAll('.menu-section');
    
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
            document.querySelector(targetId).classList.add('active');
        });
    });
    
    // Поиск по меню
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    
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
            return;
        }
        
        // Скрываем все элементы меню
        document.querySelectorAll('.menu-item').forEach(item => {
            item.style.display = 'none';
        });
        
        // Показываем только соответствующие поиску элементы
        document.querySelectorAll('.menu-item').forEach(item => {
            const title = item.querySelector('h3').textContent.toLowerCase();
            const description = item.querySelector('p').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || description.includes(searchTerm)) {
                item.style.display = 'flex';
            }
        });
    }
    
    // Функционал корзины
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
    
    // Открытие/закрытие корзины
    cartToggle.addEventListener('click', function() {
        cartSidebar.classList.add('active');
    });
    
    closeCart.addEventListener('click', function() {
        cartSidebar.classList.remove('active');
    });
    
    // Закрытие модального окна благодарности
    closeThankYou.addEventListener('click', function() {
        thankYouModal.classList.remove('active');
    });
    
   addToCartButtons.forEach(button => {
    button.addEventListener('click', function() {
        let itemName, itemPrice;
        
        // Проверяем, это лимитированное предложение или обычный товар
        if (this.closest('.offer-item')) {
            // Для лимитированных предложений
            const offerItem = this.closest('.offer-item');
            itemName = offerItem.querySelector('h3').textContent;
            itemPrice = parseInt(offerItem.querySelector('.price').textContent);
        } else {
            // Для обычных товаров меню
            const menuItem = this.closest('.menu-item');
            itemName = menuItem.querySelector('h3').textContent;
            itemPrice = parseInt(menuItem.querySelector('.price').textContent);
        }
        
        addToCart(itemName, itemPrice);
    });
});
    
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
        cartSidebar.classList.add('active');
    }
    
    function updateCart() {
        // Очищаем контейнер корзины
        cartItemsContainer.innerHTML = '';
        
        // Сбрасываем общую стоимость
        totalPrice = 0;
        
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
                    <span>${item.quantity}</span>
                    <button class="quantity-btn plus" data-name="${item.name}">+</button>
                </div>
            `;
            
            cartItemsContainer.appendChild(cartItemElement);
        });
        
        // Обновляем общую стоимость и количество товаров
        totalPriceElement.textContent = totalPrice;
        cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
        
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
    checkoutBtn.addEventListener('click', function() {
        if (cart.length === 0) {
            alert('Ваша корзина пуста!');
            return;
        }
        
        // Показываем модальное окно благодарности
        thankYouModal.classList.add('active');
        
        // Очищаем корзину после оформления заказа
        cart = [];
        updateCart();
        cartSidebar.classList.remove('active');
    });
});

// Навигация по вкладкам с плавной прокруткой
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    const menuSections = document.querySelectorAll('.menu-section');
    
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
            targetSection.classList.add('active');
            
            // Плавная прокрутка к секции
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });
    });
    
    // Остальной код остается без изменений...
    // Поиск по меню, корзина и т.д.
});