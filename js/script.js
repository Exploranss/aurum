// Основные функции для работы сайта
document.addEventListener('DOMContentLoaded', function() {
    // Мобильное меню
    const menuToggle = document.querySelector('.menu-toggle');
    const menuItems = document.querySelector('.menu-items');

    if (menuToggle && menuItems) { // Добавил проверку menuItems
        menuToggle.addEventListener('click', function() {
            menuItems.classList.toggle('active');
        });
    }

    // Слайдер отзывов (если есть на странице)
    const testimonialsSlider = document.querySelector('.testimonials-slider'); // Ищем сам слайдер
    if (testimonialsSlider) {
        const testimonials = testimonialsSlider.querySelectorAll('.testimonial-item');
        const prevBtn = document.querySelector('.slider-prev');
        const nextBtn = document.querySelector('.slider-next');

        if (testimonials.length > 0 && prevBtn && nextBtn) {
            let currentSlide = 0;

            function showSlide(n) {
                 // Используем Flexbox для прокрутки (предполагается, что стили настроены для этого)
                 // Или можно просто менять display: none / block
                 testimonials.forEach((item, index) => {
                    item.style.display = index === n ? 'block' : 'none';
                 });
                 // Если используется flex-прокрутка:
                 // testimonialsSlider.style.transform = `translateX(-${n * 100}%)`;
            }

            // Инициализация при загрузке
            if (testimonials.length > 0) {
                showSlide(currentSlide);
            }


            prevBtn.addEventListener('click', function() {
                currentSlide = (currentSlide - 1 + testimonials.length) % testimonials.length;
                showSlide(currentSlide);
            });

            nextBtn.addEventListener('click', function() {
                currentSlide = (currentSlide + 1) % testimonials.length;
                showSlide(currentSlide);
            });
        }
    }


    // Галерея товара (если есть на странице)
    const mainImage = document.getElementById('current-image');
    const thumbnailsContainer = document.querySelector('.thumbnails'); // Ищем контейнер миниатюр

    if (mainImage && thumbnailsContainer) {
        const thumbnails = thumbnailsContainer.querySelectorAll('img');
        const prevGalleryBtn = document.querySelector('.gallery-nav.prev');
        const nextGalleryBtn = document.querySelector('.gallery-nav.next');
        let currentImageIndex = 0; // Индекс текущего изображения

        function updateGallery(index) {
            if (index >= 0 && index < thumbnails.length) {
                const newSrc = thumbnails[index].getAttribute('data-main-src') || thumbnails[index].src; // Используем data-main-src если есть
                mainImage.src = newSrc;
                thumbnails.forEach(t => t.classList.remove('active'));
                thumbnails[index].classList.add('active');
                currentImageIndex = index;
            }
        }

        thumbnails.forEach((thumb, index) => {
            // Убедимся, что у миниатюр есть data-main-src или используем их собственный src
            if (!thumb.hasAttribute('data-main-src')) {
                 thumb.setAttribute('data-main-src', thumb.src);
            }
            thumb.addEventListener('click', function() {
                updateGallery(index);
            });
        });

        if (prevGalleryBtn && nextGalleryBtn) {
            prevGalleryBtn.addEventListener('click', function() {
                const newIndex = (currentImageIndex - 1 + thumbnails.length) % thumbnails.length;
                updateGallery(newIndex);
            });

            nextGalleryBtn.addEventListener('click', function() {
                const newIndex = (currentImageIndex + 1) % thumbnails.length;
                updateGallery(newIndex);
            });
        }

        // Инициализация - делаем первую миниатюру активной
        if (thumbnails.length > 0) {
            updateGallery(0);
        }
    }


    // Выбор размера (если есть на странице)
    const sizeOptionsContainer = document.querySelector('.size-options');
    if (sizeOptionsContainer) {
        const sizeButtons = sizeOptionsContainer.querySelectorAll('.size-btn');
        sizeButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                sizeButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            });
        });
        // Активируем первый размер по умолчанию, если нужно
        if (sizeButtons.length > 0 && !sizeOptionsContainer.querySelector('.size-btn.active')) {
           // sizeButtons[0].classList.add('active'); // Раскомментируй, если надо
        }
    }


    // Выбор цвета (кнопки должны иметь data-color и data-url для перехода)
    const colorOptionsContainer = document.querySelector('.color-options');
    if (colorOptionsContainer) {
        const colorButtons = colorOptionsContainer.querySelectorAll('.color-btn');
        colorButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const color = this.getAttribute('data-color');
                const url = this.getAttribute('data-url'); // URL страницы для этого цвета

                // Убираем активность со всех, добавляем текущей
                colorButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');

                // Переход на страницу соответствующего цвета, если URL указан
                if (url && window.location.pathname !== url) { // Проверяем, что мы не на той же странице
                     window.location.href = url;
                } else if (color) {
                    // Можно добавить логику, если URL не указан, но нужно что-то сделать
                    console.log('Выбран цвет:', color);
                }
            });
        });
         // Активируем кнопку текущего цвета, если есть data-current-color на контейнере
        const currentProductColor = colorOptionsContainer.getAttribute('data-current-color');
        if (currentProductColor) {
             const currentBtn = colorOptionsContainer.querySelector(`.color-btn[data-color="${currentProductColor}"]`);
             if (currentBtn) {
                 currentBtn.classList.add('active');
             }
        }
    }


    // Выбор количества (если есть на странице)
    const quantitySelector = document.querySelector('.quantity-selector');
    if (quantitySelector) {
        const minusBtn = quantitySelector.querySelector('.quantity-btn.minus');
        const plusBtn = quantitySelector.querySelector('.quantity-btn.plus');
        const quantityInput = quantitySelector.querySelector('.quantity-input');

        if (minusBtn && plusBtn && quantityInput) {
            minusBtn.addEventListener('click', function() {
                let value = parseInt(quantityInput.value);
                if (value > 1) {
                    quantityInput.value = value - 1;
                }
            });

            plusBtn.addEventListener('click', function() {
                let value = parseInt(quantityInput.value);
                // Можно добавить максимальное количество, если нужно
                // const maxQuantity = 10;
                // if (value < maxQuantity) {
                quantityInput.value = value + 1;
                // }
            });

             // Убедимся, что значение по умолчанию не меньше 1
             if (parseInt(quantityInput.value) < 1) {
                 quantityInput.value = 1;
             }
        }
    }


    // Добавление в корзину (если есть кнопка)
    const addToCartBtn = document.querySelector('.add-to-cart-btn');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function() {
            // Собираем информацию о товаре
            const productContainer = document.querySelector('.product-info'); // Ищем родительский блок
            const productTitleElement = document.getElementById('product-title') || productContainer?.querySelector('h1');
            const productPriceElement = productContainer?.querySelector('.product-price');
            const activeSizeElement = document.querySelector('.size-btn.active');
            const activeColorElement = document.querySelector('.color-btn.active');
            const quantityInputElement = document.querySelector('.quantity-input');
            const productImageElement = document.getElementById('current-image'); // Главное изображение

            // Проверки на наличие элементов
            if (!productTitleElement || !productPriceElement || !activeSizeElement || !activeColorElement || !quantityInputElement || !productImageElement) {
                console.error("Не удалось найти все элементы товара для добавления в корзину.");
                alert("Произошла ошибка при добавлении товара. Попробуйте обновить страницу.");
                return;
            }

            const productTitle = productTitleElement.textContent.trim();
            const productPrice = productPriceElement.textContent.trim();
            const productSize = activeSizeElement.getAttribute('data-size');
            const productColor = activeColorElement.getAttribute('data-color'); // 'blue' или 'brown'
             const productQuantity = parseInt(quantityInputElement.value);
            // Берем src миниатюры активного цвета, если есть, иначе главное изображение
            const productThumbImage = activeColorElement.getAttribute('data-thumb-src') || productImageElement.src;

            if (productQuantity < 1) {
                 alert("Выберите количество товара.");
                 return;
            }
            if (!productSize) {
                 alert("Выберите размер.");
                 return;
            }
             if (!productColor) {
                 alert("Произошла ошибка с определением цвета. Попробуйте еще раз.");
                 return;
            }


            // Создаем объект товара
            const product = {
                // Добавляем ID, если он есть (например, из data-id атрибута кнопки или контейнера)
                id: productContainer?.getAttribute('data-product-id') || `${productTitle}-${productColor}-${productSize}`, // Уникальный ID для товара в корзине
                title: productTitle,
                price: productPrice, // Строка с '₽'
                size: productSize,
                color: productColor, // 'blue' или 'brown'
                quantity: productQuantity,
                image: productThumbImage // Используем миниатюру или главное изображение
            };

            // Получаем текущую корзину из localStorage
            let cart = JSON.parse(localStorage.getItem('cart')) || [];

            // Проверяем, есть ли уже такой товар (по ID) в корзине
            const existingProductIndex = cart.findIndex(item => item.id === product.id);

            if (existingProductIndex > -1) {
                // Если товар уже есть, просто обновляем количество
                cart[existingProductIndex].quantity += product.quantity;
                 // Убедимся, что количество не превышает максимум (если он есть)
                 // if (cart[existingProductIndex].quantity > maxQuantity) cart[existingProductIndex].quantity = maxQuantity;
            } else {
                // Если товара нет, добавляем его
                cart.push(product);
            }


            // Сохраняем обновленную корзину в localStorage
            localStorage.setItem('cart', JSON.stringify(cart));

            // Обновляем счетчик товаров в корзине в шапке
            updateCartCount();

            // Показываем уведомление
            alert(`"${productTitle}" (${productColor === 'blue' ? 'Синий' : 'Коричневый'}, ${productSize}) x ${productQuantity} шт. добавлен в корзину!`);

             // Можно добавить анимацию добавления или переход в корзину
             // window.location.href = 'cart.html';
        });
    }


    // Обновление счетчика товаров в корзине (вызывается из разных мест)
    function updateCartCount() {
        const cartCountElement = document.querySelector('.cart-count');
        if (cartCountElement) {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            let totalItems = 0;
            cart.forEach(item => {
                totalItems += item.quantity; // Суммируем количество каждого товара
            });
             cartCountElement.textContent = totalItems;
             // Показываем/скрываем счетчик если он 0
             cartCountElement.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }

    // Вызываем функцию при загрузке страницы для инициализации счетчика
    updateCartCount();


    // --- КОД ДЛЯ СТРАНИЦЫ КОРЗИНЫ (cart.html) ---
    const cartItemsContainer = document.getElementById('cart-items'); // Контейнер для товаров в корзине
    const cartEmptyMessage = document.getElementById('cart-empty'); // Сообщение о пустой корзине
    const cartSummaryBlock = document.getElementById('cart-summary'); // Блок с итогами

    // Проверяем, что мы на странице корзины
    if (cartItemsContainer && cartEmptyMessage && cartSummaryBlock) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];

        if (cart.length === 0) {
            // Корзина пуста
            cartEmptyMessage.style.display = 'block'; // Показываем сообщение
            cartItemsContainer.style.display = 'none'; // Скрываем блок товаров
            cartSummaryBlock.style.display = 'none'; // Скрываем блок итогов
        } else {
            // Корзина не пуста
            cartEmptyMessage.style.display = 'none'; // Скрываем сообщение
            cartItemsContainer.style.display = 'block'; // Показываем блок товаров
            cartSummaryBlock.style.display = 'block'; // Показываем блок итогов

            // Очищаем контейнер перед добавлением
            cartItemsContainer.innerHTML = '';
            let totalCartPrice = 0;

            cart.forEach((item, index) => {
                const priceValue = parseInt(item.price.replace(/\D/g, '')); // Числовая цена
                const itemTotalPrice = priceValue * item.quantity;
                totalCartPrice += itemTotalPrice;

                const cartItemElement = document.createElement('div');
                cartItemElement.className = 'cart-item';
                cartItemElement.innerHTML = `
                    <img src="${item.image}" alt="${item.title}" class="cart-item-image">
                    <div class="cart-item-details">
                        <h3>${item.title}</h3>
                        <p>Цвет: ${item.color === 'blue' ? 'Синий' : 'Коричневый'}</p>
                        <p>Размер: ${item.size}</p>
                        <p class="cart-item-price">Цена: ${item.price}</p>
                    </div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn minus" data-index="${index}" aria-label="Уменьшить количество">-</button>
                        <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="10" data-index="${index}" aria-label="Количество">
                        <button class="quantity-btn plus" data-index="${index}" aria-label="Увеличить количество">+</button>
                    </div>
                    <div class="cart-item-total-price">
                        <span>${itemTotalPrice} ₽</span>
                    </div>
                    <button class="cart-item-remove" data-index="${index}" aria-label="Удалить товар">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                `;
                cartItemsContainer.appendChild(cartItemElement);
            });

            // Обновляем итоговую сумму в блоке cart-summary
            const cartTotalPriceElement = cartSummaryBlock.querySelector('.total-price');
            if (cartTotalPriceElement) {
                cartTotalPriceElement.textContent = `${totalCartPrice} ₽`;
            }

            // --- Добавляем обработчики для кнопок +/- и удаления ВНУТРИ КОРЗИНЫ ---
            cartItemsContainer.addEventListener('click', function(event) {
                const target = event.target;
                const index = parseInt(target.getAttribute('data-index'));

                if (target.classList.contains('quantity-btn') || target.closest('.quantity-btn')) {
                     const button = target.closest('.quantity-btn');
                     const index = parseInt(button.getAttribute('data-index'));
                     if (isNaN(index)) return;

                     const currentItem = cart[index];
                     if (!currentItem) return;

                    if (button.classList.contains('minus')) {
                        if (currentItem.quantity > 1) {
                            currentItem.quantity--;
                        } else {
                             // Если количество становится 0, предлагаем удалить
                            if (confirm(`Удалить "${currentItem.title}" из корзины?`)) {
                                cart.splice(index, 1);
                            } else {
                                 return; // Отмена действия
                            }
                        }
                    } else if (button.classList.contains('plus')) {
                        // Ограничение максимума (например 10)
                        if (currentItem.quantity < 10) {
                            currentItem.quantity++;
                        } else {
                             alert("Вы не можете добавить больше 10 единиц одного товара.");
                             return;
                        }
                    }
                    // Сохраняем изменения и перезагружаем страницу корзины
                    localStorage.setItem('cart', JSON.stringify(cart));
                    window.location.reload(); // Перезагрузка для обновления всего

                } else if (target.classList.contains('cart-item-remove') || target.closest('.cart-item-remove')) {
                    const button = target.closest('.cart-item-remove');
                    const index = parseInt(button.getAttribute('data-index'));
                     if (isNaN(index)) return;

                     const currentItem = cart[index];
                    if (confirm(`Удалить "${currentItem.title}" из корзины?`)) {
                        cart.splice(index, 1); // Удаляем товар из массива
                        localStorage.setItem('cart', JSON.stringify(cart)); // Сохраняем
                        window.location.reload(); // Перезагружаем
                    }
                }
            });

            // Обработчик изменения количества через input
             cartItemsContainer.addEventListener('change', function(event) {
                 if (event.target.classList.contains('quantity-input')) {
                     const input = event.target;
                     const index = parseInt(input.getAttribute('data-index'));
                     let newQuantity = parseInt(input.value);

                     if (isNaN(index) || isNaN(newQuantity)) return;

                     const currentItem = cart[index];
                     if (!currentItem) return;

                     // Валидация введенного значения
                     if (newQuantity < 1) {
                         if (confirm(`Удалить "${currentItem.title}" из корзины?`)) {
                                cart.splice(index, 1);
                         } else {
                             input.value = currentItem.quantity; // Возвращаем старое значение
                             return;
                         }
                     } else if (newQuantity > 10) { // Ограничение
                         alert("Вы не можете добавить больше 10 единиц одного товара.");
                         newQuantity = 10; // Устанавливаем максимум
                         input.value = newQuantity;
                     }

                      if (cart[index]) { // Проверяем, не удалили ли элемент на предыдущем шаге
                         cart[index].quantity = newQuantity;
                      }

                     localStorage.setItem('cart', JSON.stringify(cart));
                     window.location.reload();
                 }
             });
        }
    }


    // --- КОД ДЛЯ СТРАНИЦЫ ОФОРМЛЕНИЯ ЗАКАЗА (checkout.html) ---
    const orderForm = document.getElementById('order-form');
    const orderItemsContainerCheckout = document.getElementById('order-items'); // Контейнер в сводке заказа
    const orderSummaryItemsPrice = document.querySelector('.order-summary .items-price');
    const orderSummaryDeliveryPrice = document.querySelector('.order-summary .delivery-price');
    const orderSummaryTotalPrice = document.querySelector('.order-summary .total-price');
    const orderDetailsInput = document.getElementById('order-details-input'); // Скрытое поле

    // Проверяем, что мы на странице ОФОРМЛЕНИЯ ЗАКАЗА и все нужные элементы есть
    if (orderForm && orderItemsContainerCheckout && orderSummaryItemsPrice && orderSummaryDeliveryPrice && orderSummaryTotalPrice && orderDetailsInput) {

        // Функция для отображения товаров, расчета итогов и заполнения скрытого поля
        function displayOrderSummary() {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            let itemsHtml = '';
            let itemsTotalPrice = 0;
            let orderDetailsText = "--- Состав заказа ---\n"; // Текст для скрытого поля и письма

            if (cart.length === 0) {
                orderItemsContainerCheckout.innerHTML = '<p>Ваша корзина пуста. Пожалуйста, добавьте товары перед оформлением заказа.</p>';
                // Блокируем кнопку отправки, если корзина пуста
                const submitBtn = orderForm.querySelector('.submit-order-btn');
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.style.opacity = 0.6;
                    submitBtn.style.cursor = 'not-allowed';
                }
                 // Обнуляем итоги
                 orderSummaryItemsPrice.textContent = `0 ₽`;
                 orderSummaryDeliveryPrice.textContent = `0 ₽`;
                 orderSummaryTotalPrice.textContent = `0 ₽`;
                 orderDetailsInput.value = "Корзина пуста";
                return; // Выходим, если корзина пуста
            } else {
                 // Разблокируем кнопку, если корзина не пуста
                 const submitBtn = orderForm.querySelector('.submit-order-btn');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.style.opacity = 1;
                    submitBtn.style.cursor = 'pointer';
                }
            }

            cart.forEach(item => {
                const priceValue = parseInt(item.price.replace(/\D/g, '')); // Получаем число из цены '5000 ₽' -> 5000
                const itemTotal = priceValue * parseInt(item.quantity);
                itemsTotalPrice += itemTotal;

                // Формируем HTML для отображения в сводке заказа справа
                itemsHtml += `
                    <div class="order-item">
                        <span>${item.title} (${item.color === 'blue' ? 'Синий' : 'Коричневый'}, ${item.size}) x ${item.quantity}</span>
                        <span>${itemTotal} ₽</span>
                    </div>
                `;

                // Формируем текст для отправки в письме (через скрытое поле)
                orderDetailsText += `- Товар: ${item.title}\n`;
                orderDetailsText += `  Цвет: ${item.color === 'blue' ? 'Синий' : 'Коричневый'}\n`;
                orderDetailsText += `  Размер: ${item.size}\n`;
                orderDetailsText += `  Количество: ${item.quantity}\n`;
                orderDetailsText += `  Цена за шт.: ${item.price}\n`;
                orderDetailsText += `  Сумма: ${itemTotal} ₽\n\n`;
            });

            // Вставляем HTML товаров в блок сводки
            orderItemsContainerCheckout.innerHTML = itemsHtml;

            // --- Расчет стоимости доставки ---
            let deliveryPrice = 0;
            let deliveryMethod = "Не выбран";
            const selectedDeliveryRadio = document.querySelector('input[name="delivery"]:checked');

            if (selectedDeliveryRadio) {
                deliveryMethod = selectedDeliveryRadio.value; // Получаем значение value ('Курьерская доставка', 'Пункт выдачи (Самовывоз)', 'Почта России')
                if (deliveryMethod === 'Курьерская доставка') {
                    deliveryPrice = 300;
                } else if (deliveryMethod === 'Почта России') {
                    deliveryPrice = 350;
                } else if (deliveryMethod === 'Пункт выдачи (Самовывоз)') {
                    deliveryPrice = 0;
                }
                // Можно добавить другие условия, например, от города
            }

            // Проверка на бесплатную доставку
            const freeDeliveryThreshold = 5000; // Порог бесплатной доставки
            let deliveryText = `${deliveryPrice} ₽`;
            if (itemsTotalPrice >= freeDeliveryThreshold && deliveryPrice > 0) {
                deliveryPrice = 0; // Обнуляем стоимость
                deliveryText = `0 ₽ (Бесплатно от ${freeDeliveryThreshold} ₽)`;
            } else if (deliveryPrice === 0 && deliveryMethod !== 'Пункт выдачи (Самовывоз)') {
                deliveryText = `0 ₽ (Бесплатно)`; // Если не самовывоз, но 0
            } else if (deliveryPrice === 0 && deliveryMethod === 'Пункт выдачи (Самовывоз)') {
                 deliveryText = `0 ₽ (Самовывоз)`;
            }
            // ------------------------------------

            const finalTotalPrice = itemsTotalPrice + deliveryPrice;

            // Обновляем цены в сводке на странице
            orderSummaryItemsPrice.textContent = `${itemsTotalPrice} ₽`;
            orderSummaryDeliveryPrice.textContent = deliveryText; // Отображаем текст с пояснением
            orderSummaryTotalPrice.textContent = `${finalTotalPrice} ₽`;

            // --- Дополняем и устанавливаем значение скрытого поля ---
            orderDetailsText += `--- Итоги ---\n`;
            orderDetailsText += `Стоимость товаров: ${itemsTotalPrice} ₽\n`;
            orderDetailsText += `Способ доставки: ${deliveryMethod}\n`;
            orderDetailsText += `Стоимость доставки: ${deliveryPrice} ₽\n`;
            orderDetailsText += `Общая сумма заказа: ${finalTotalPrice} ₽\n`;
             orderDetailsText += `------------------`;

            orderDetailsInput.value = orderDetailsText; // Вставляем весь текст заказа в скрытое поле
        }

        // Вызываем функцию отображения сводки при загрузке страницы checkout
        displayOrderSummary();

        // Добавляем слушатель на изменение способа доставки, чтобы пересчитать итог
        document.querySelectorAll('input[name="delivery"]').forEach(radio => {
            radio.addEventListener('change', displayOrderSummary);
        });

        // ВАЖНО: Очистка корзины после УСПЕШНОЙ отправки.
        // Formspree перенаправит пользователя. Лучше всего настроить
        // редирект в Formspree на страницу "Спасибо" (thank_you.html)
        // и добавить скрипт очистки localStorage ИМЕННО НА НЕЙ.
        // Пример скрипта для thank_you.html:
        // <script>
        //    localStorage.removeItem('cart');
        //    console.log('Корзина очищена после успешного заказа.');
        //    // Можно также попробовать обновить счетчик в шапке, если она есть на thank_you.html
        //    const cartCountEl = document.querySelector('.cart-count');
        //    if(cartCountEl) cartCountEl.textContent = '0';
        // </script>
        // Не добавляйте очистку здесь перед отправкой, т.к. отправка может не удаться.

    } // конец if (для страницы checkout)

    // --- КОД ДЛЯ ФИЛЬТРАЦИИ В КАТАЛОГЕ (catalog.html) ---
    const productsGrid = document.querySelector('.products-grid'); // Ищем сетку товаров
    const filterButtonsContainer = document.querySelector('.filters .filter-options'); // Ищем контейнер кнопок фильтра

    if (productsGrid && filterButtonsContainer) {
        const productCards = productsGrid.querySelectorAll('.product-card');
        const filterButtons = filterButtonsContainer.querySelectorAll('.filter-btn');

        function filterProducts(filterValue) {
            productCards.forEach(card => {
                const cardColor = card.getAttribute('data-color'); // Получаем цвет из data-атрибута карточки

                if (filterValue === 'all' || !filterValue || !cardColor || cardColor === filterValue) {
                    card.style.display = 'block'; // Показываем, если фильтр 'Все' или цвет совпадает
                } else {
                    card.style.display = 'none'; // Скрываем, если не совпадает
                }
            });

            // Обновляем активную кнопку фильтра
            filterButtons.forEach(btn => {
                 btn.classList.remove('active');
                 if (btn.getAttribute('data-filter') === filterValue) {
                     btn.classList.add('active');
                 }
            });
        }

        // Добавляем обработчики на кнопки фильтров
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                const filterValue = this.getAttribute('data-filter'); // Получаем значение фильтра ('all', 'blue', 'brown')
                filterProducts(filterValue);

                // Обновляем URL, чтобы сохранить фильтр (необязательно)
                const url = new URL(window.location);
                if (filterValue && filterValue !== 'all') {
                    url.searchParams.set('color', filterValue);
                } else {
                    url.searchParams.delete('color');
                }
                // Используем pushState для обновления URL без перезагрузки
                // window.history.pushState({}, '', url);
                // Или просто перезагружаем с новым параметром:
                // window.location.href = url.toString();
                // Пока оставим без обновления URL для простоты
            });
        });

        // Применяем фильтр при загрузке страницы, если он есть в URL
        const urlParams = new URLSearchParams(window.location.search);
        const initialColorFilter = urlParams.get('color') || 'all'; // 'all' по умолчанию
        filterProducts(initialColorFilter);
    }


    // --- КОД ДЛЯ ФОРМЫ КОНТАКТОВ (contacts.html) ---
    // Предполагаем, что форма контактов тоже отправляется через Formspree или аналогичный сервис
    // и имеет id="contact-form" и блок успеха id="form-success"
    const contactForm = document.getElementById('contact-form');
    const formSuccessMessage = document.getElementById('form-success'); // Блок с сообщением об успехе

    if (contactForm && formSuccessMessage) {
         // Если форма отправляется стандартно (не через JS fetch) на Formspree,
         // то Formspree сам обработает редирект или покажет свое сообщение.
         // Этот код нужен, если бы мы перехватывали отправку JS:
        /*
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Предотвращаем стандартную отправку

            // Здесь могла бы быть отправка через fetch() к вашему Formspree endpoint
            // fetch(contactForm.action, { method: 'POST', body: new FormData(contactForm), headers: {'Accept': 'application/json'}})
            // .then(response => {
            //     if (response.ok) {
            //         contactForm.style.display = 'none'; // Скрываем форму
            //         formSuccessMessage.style.display = 'block'; // Показываем сообщение
            //         contactForm.reset(); // Очищаем поля формы
            //     } else {
            //         // Обработка ошибки отправки
            //         alert('Ошибка при отправке сообщения. Пожалуйста, попробуйте еще раз.');
            //     }
            // })
            // .catch(error => {
            //     alert('Ошибка сети при отправке сообщения.');
            // });

            // Пока просто имитируем успех для примера, если нет JS отправки
            // Но лучше настроить редирект Formspree
            // contactForm.style.display = 'none';
            // formSuccessMessage.style.display = 'block';
        });
        */
    }


}); // --- КОНЕЦ ГЛАВНОГО DOMContentLoaded ---
