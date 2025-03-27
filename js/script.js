// Основные функции для работы сайта
document.addEventListener('DOMContentLoaded', function() {
    // Мобильное меню
    const menuToggle = document.querySelector('.menu-toggle');
    const menuItems = document.querySelector('.menu-items');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            menuItems.classList.toggle('active');
        });
    }
    
    // Слайдер отзывов
    const testimonials = document.querySelectorAll('.testimonial-item');
    const prevBtn = document.querySelector('.slider-prev');
    const nextBtn = document.querySelector('.slider-next');
    
    if (testimonials.length > 0 && prevBtn && nextBtn) {
        let currentSlide = 0;
        
        function showSlide(n) {
            testimonials.forEach(item => item.style.display = 'none');
            testimonials[n].style.display = 'block';
        }
        
        showSlide(currentSlide);
        
        prevBtn.addEventListener('click', function() {
            currentSlide = (currentSlide - 1 + testimonials.length) % testimonials.length;
            showSlide(currentSlide);
        });
        
        nextBtn.addEventListener('click', function() {
            currentSlide = (currentSlide + 1) % testimonials.length;
            showSlide(currentSlide);
        });
    }
    
    // Галерея товара
    const mainImage = document.getElementById('current-image');
    const thumbnails = document.querySelectorAll('.thumbnails img');
    const prevGalleryBtn = document.querySelector('.gallery-nav.prev');
    const nextGalleryBtn = document.querySelector('.gallery-nav.next');
    
    if (mainImage && thumbnails.length > 0) {
        let currentImage = 0;
        
        thumbnails.forEach((thumb, index) => {
            thumb.addEventListener('click', function() {
                mainImage.src = this.getAttribute('data-src');
                thumbnails.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                currentImage = index;
            });
        });
        
        if (prevGalleryBtn && nextGalleryBtn) {
            prevGalleryBtn.addEventListener('click', function() {
                currentImage = (currentImage - 1 + thumbnails.length) % thumbnails.length;
                mainImage.src = thumbnails[currentImage].getAttribute('data-src');
                thumbnails.forEach(t => t.classList.remove('active'));
                thumbnails[currentImage].classList.add('active');
            });
            
            nextGalleryBtn.addEventListener('click', function() {
                currentImage = (currentImage + 1) % thumbnails.length;
                mainImage.src = thumbnails[currentImage].getAttribute('data-src');
                thumbnails.forEach(t => t.classList.remove('active'));
                thumbnails[currentImage].classList.add('active');
            });
        }
    }
    
    // Выбор размера
    const sizeButtons = document.querySelectorAll('.size-btn');
    
    if (sizeButtons.length > 0) {
        sizeButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                sizeButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }
    
    // Выбор цвета
    const colorButtons = document.querySelectorAll('.color-btn');
    
    if (colorButtons.length > 0) {
        colorButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const color = this.getAttribute('data-color');
                colorButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Переход на страницу соответствующего цвета
                if (color === 'blue') {
                    window.location.href = 'product_blue.html';
                } else if (color === 'brown') {
                    window.location.href = 'product_brown.html';
                }
            });
        });
    }
    
    // Выбор количества
    const minusBtn = document.querySelector('.quantity-btn.minus');
    const plusBtn = document.querySelector('.quantity-btn.plus');
    const quantityInput = document.querySelector('.quantity-input');
    
    if (minusBtn && plusBtn && quantityInput) {
        minusBtn.addEventListener('click', function() {
            let value = parseInt(quantityInput.value);
            if (value > 1) {
                quantityInput.value = value - 1;
            }
        });
        
        plusBtn.addEventListener('click', function() {
            let value = parseInt(quantityInput.value);
            if (value < 10) {
                quantityInput.value = value + 1;
            }
        });
    }
    
    // Добавление в корзину
    const addToCartBtn = document.querySelector('.add-to-cart-btn');
    
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function() {
            const productTitle = document.getElementById('product-title').textContent;
            const productPrice = document.querySelector('.product-price').textContent;
            const productSize = document.querySelector('.size-btn.active').getAttribute('data-size');
            const productColor = document.querySelector('.color-btn.active').getAttribute('data-color');
            const productQuantity = document.querySelector('.quantity-input').value;
            const productImage = document.getElementById('current-image').src;
            
            // Создаем объект товара
            const product = {
                title: productTitle,
                price: productPrice,
                size: productSize,
                color: productColor,
                quantity: productQuantity,
                image: productImage
            };
            
            // Получаем текущую корзину из localStorage
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            
            // Добавляем товар в корзину
            cart.push(product);
            
            // Сохраняем корзину в localStorage
            localStorage.setItem('cart', JSON.stringify(cart));
            
            // Обновляем счетчик товаров в корзине
            updateCartCount();
            
            // Показываем уведомление
            alert('Товар добавлен в корзину!');
        });
    }
    
    // Обновление счетчика товаров в корзине
    function updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        if (cartCount) {
            cartCount.textContent = cart.length;
        }
    }
    
    // Вызываем функцию при загрузке страницы
    updateCartCount();
    
    // Отображение товаров в корзине
    const cartItems = document.getElementById('cart-items');
    const cartEmpty = document.getElementById('cart-empty');
    const cartSummary = document.getElementById('cart-summary');
    
    if (cartItems && cartEmpty && cartSummary) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        if (cart.length > 0) {
            cartEmpty.style.display = 'none';
            cartItems.style.display = 'block';
            cartSummary.style.display = 'block';
            
            // Очищаем контейнер
            cartItems.innerHTML = '';
            
            // Добавляем товары
            let totalPrice = 0;
            
            cart.forEach((item, index) => {
                const priceValue = parseInt(item.price.replace(/\D/g, ''));
                const itemTotal = priceValue * item.quantity;
                totalPrice += itemTotal;
                
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <div class="cart-item-image">
                        <img src="${item.image}" alt="${item.title}">
                    </div>
                    <div class="cart-item-info">
                        <h3>${item.title}</h3>
                        <p>Цвет: ${item.color === 'blue' ? 'Синий' : 'Коричневый'}</p>
                        <p>Размер: ${item.size}</p>
                        <p>Цена: ${item.price}</p>
                        <div class="cart-item-quantity">
                            <button class="quantity-btn minus" data-index="${index}">-</button>
                            <span>${item.quantity}</span>
                            <button class="quantity-btn plus" data-index="${index}">+</button>
                        </div>
                    </div>
                    <div class="cart-item-total">
                        <p>${itemTotal} ₽</p>
                        <button class="remove-btn" data-index="${index}">Удалить</button>
                    </div>
                `;
                
                cartItems.appendChild(cartItem);
            });
            
            // Обновляем итоговую сумму
            document.querySelector('.total-price').textContent = totalPrice + ' ₽';
            
            // Добавляем обработчики событий для кнопок в корзине
            document.querySelectorAll('.cart-item .quantity-btn.minus').forEach(btn => {
                btn.addEventListener('click', function() {
                    const index = parseInt(this.getAttribute('data-index'));
                    if (cart[index].quantity > 1) {
                        cart[index].quantity--;
                        localStorage.setItem('cart', JSON.stringify(cart));
                        location.reload();
                    }
                });
            });
            
            document.querySelectorAll('.cart-item .quantity-btn.plus').forEach(btn => {
                btn.addEventListener('click', function() {
                    const index = parseInt(this.getAttribute('data-index'));
                    if (cart[index].quantity < 10) {
                        cart[index].quantity++;
                        localStorage.setItem('cart', JSON.stringify(cart));
                        location.reload();
                    }
                });
            });
            
            document.querySelectorAll('.cart-item .remove-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const index = parseInt(this.getAttribute('data-index'));
                    cart.splice(index, 1);
                    localStorage.setItem('cart', JSON.stringify(cart));
                    location.reload();
                });
            });
        }
    }
    
    // Фильтрация товаров в каталоге
    const urlParams = new URLSearchParams(window.location.search);
    const colorFilter = urlParams.get('color');
    const productCards = document.querySelectorAll('.product-card');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    if (productCards.length > 0 && filterButtons.length > 0) {
        // Активируем соответствующую кнопку фильтра
        filterButtons.forEach(btn => {
            btn.classList.remove('active');
            if ((colorFilter === null && btn.textContent === 'Все') || 
                (colorFilter === 'blue' && btn.textContent === 'Синий') || 
                (colorFilter === 'brown' && btn.textContent === 'Коричневый')) {
                btn.classList.add('active');
            }
        });
        
        // Фильтруем товары
        if (colorFilter) {
            productCards.forEach(card => {
                if (card.getAttribute('data-color') === colorFilter) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        }
    }
    
    // Обработка формы контактов
    const contactForm = document.getElementById('contact-form');
    const formSuccess = document.getElementById('form-success');
    
    if (contactForm && formSuccess) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            contactForm.style.display = 'none';
            formSuccess.style.display = 'block';
        });
    }
});
