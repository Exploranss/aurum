/**
 * AURUM - Основной скрипт для сайта
 * Включает:
 * - Мобильное меню
 * - Управление корзиной (localStorage)
 * - Логику страницы товара (галерея, выбор опций, добавление в корзину)
 * - Логику страницы корзины (отображение, изменение, удаление)
 * - Логику страницы оформления заказа (сводка, AJAX отправка на Formspree, очистка корзины)
 * - Логику страницы каталога (фильтрация)
 */

document.addEventListener('DOMContentLoaded', function() {

    // --- ГЛОБАЛЬНЫЕ ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---

    /**
     * Обновляет счетчик товаров в корзине в шапке сайта.
     * Суммирует количество всех позиций в корзине.
     */
    function updateCartCount() {
        const cartCountElement = document.querySelector('.cart-count');
        if (!cartCountElement) return; // Выходим, если элемента нет

        try {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            let totalItems = 0;
            cart.forEach(item => {
                const quantity = parseInt(item.quantity);
                if (!isNaN(quantity)) {
                    totalItems += quantity; // Суммируем количество каждой позиции
                }
            });
            cartCountElement.textContent = totalItems;
            // Показываем/скрываем сам счетчик
            cartCountElement.style.display = totalItems > 0 ? 'flex' : 'none';
        } catch (e) {
            console.error("Ошибка при обновлении счетчика корзины:", e);
            cartCountElement.textContent = '0';
            cartCountElement.style.display = 'none';
        }
    }

    // Инициализация счетчика при первой загрузке любой страницы
    updateCartCount();


    // --- МОБИЛЬНОЕ МЕНЮ ---
    const menuToggle = document.querySelector('.menu-toggle');
    const menuItems = document.querySelector('.menu-items');

    if (menuToggle && menuItems) {
        menuToggle.addEventListener('click', function() {
            const isActive = menuItems.classList.toggle('active');
            // Добавляем/убираем класс на body для возможной стилизации (например, запрет прокрутки)
            document.body.classList.toggle('menu-open', isActive);
            // Меняем иконку бургер/крестик (опционально)
            const icon = menuToggle.querySelector('i');
            if (icon) {
                icon.className = isActive ? 'fas fa-times' : 'fas fa-bars';
            }
        });
        // Закрываем меню при клике на ссылку внутри него (для одностраничников или просто удобства)
        menuItems.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (menuItems.classList.contains('active')) {
                    menuItems.classList.remove('active');
                    document.body.classList.remove('menu-open');
                    const icon = menuToggle.querySelector('i');
                     if (icon) icon.className = 'fas fa-bars';
                }
            });
        });
    }


    // --- ЛОГИКА ДЛЯ СТРАНИЦЫ ТОВАРА (product_*.html) ---
    // Определяем, находимся ли мы на странице товара по наличию специфических элементов
    const productPageIdentifier = document.querySelector('.product-page .product-container');
    if (productPageIdentifier) {

        // 1. Галерея изображений товара
        const mainImage = document.getElementById('current-image');
        const thumbnailsContainer = document.querySelector('.thumbnails');
        if (mainImage && thumbnailsContainer) {
            const thumbnails = thumbnailsContainer.querySelectorAll('img');
            const prevGalleryBtn = document.querySelector('.gallery-nav.prev');
            const nextGalleryBtn = document.querySelector('.gallery-nav.next');
            let currentImageIndex = 0;

            function updateGallery(index) {
                if (index >= 0 && index < thumbnails.length) {
                    // Используем data-main-src если есть, иначе src самой миниатюры
                    const newSrc = thumbnails[index].getAttribute('data-main-src') || thumbnails[index].src;
                    mainImage.src = newSrc;
                    // Обновляем активный класс у миниатюр
                    thumbnails.forEach(t => t.classList.remove('active'));
                    thumbnails[index].classList.add('active');
                    currentImageIndex = index;
                }
            }

            thumbnails.forEach((thumb, index) => {
                 // Убедимся, что у всех есть data-main-src для единообразия
                if (!thumb.hasAttribute('data-main-src')) {
                    thumb.setAttribute('data-main-src', thumb.src);
                }
                thumb.addEventListener('click', function() { updateGallery(index); });
            });

            // Обработчики кнопок Prev/Next галереи
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

            // Инициализация галереи: показываем первое изображение
            if (thumbnails.length > 0) { updateGallery(0); }
        }

        // 2. Выбор размера
        const sizeOptionsContainer = document.querySelector('.size-options');
        if (sizeOptionsContainer) {
            const sizeButtons = sizeOptionsContainer.querySelectorAll('.size-btn');
            sizeButtons.forEach(btn => {
                btn.addEventListener('click', function() {
                    if (this.classList.contains('disabled')) return; // Игнорируем неактивные размеры
                    sizeButtons.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                });
            });
            // Активация первого доступного (не disabled) размера по умолчанию
            const firstAvailableSize = sizeOptionsContainer.querySelector('.size-btn:not(.disabled)');
            if (firstAvailableSize && !sizeOptionsContainer.querySelector('.size-btn.active')) {
                 firstAvailableSize.classList.add('active');
            }
        }

        // 3. Выбор цвета (предполагается, что это кнопки-ссылки на другие страницы товара)
        const colorOptionsContainer = document.querySelector('.color-options');
        if (colorOptionsContainer) {
            const colorButtons = colorOptionsContainer.querySelectorAll('.color-btn');
            colorButtons.forEach(btn => {
                btn.addEventListener('click', function(event) {
                    const url = this.getAttribute('data-url');
                    // Переходим по ссылке только если она есть и отличается от текущей страницы
                    if (url && url !== window.location.pathname && url !== window.location.href) {
                        window.location.href = url;
                    } else {
                        // Если URL нет или он совпадает, просто делаем активной (хотя это нелогично для ссылок)
                         event.preventDefault(); // Предотвращаем переход по # если href="#"
                         colorButtons.forEach(b => b.classList.remove('active'));
                         this.classList.add('active');
                    }
                });
            });
            // Активация кнопки текущего цвета на странице
            const currentProductColor = colorOptionsContainer.getAttribute('data-current-color');
            if (currentProductColor) {
                 const currentBtn = colorOptionsContainer.querySelector(`.color-btn[data-color="${currentProductColor}"]`);
                 if (currentBtn) {
                     currentBtn.classList.add('active');
                 }
            }
        }

        // 4. Выбор количества товара
        const quantitySelector = document.querySelector('.quantity-selector');
        if (quantitySelector) {
            const minusBtn = quantitySelector.querySelector('.quantity-btn.minus');
            const plusBtn = quantitySelector.querySelector('.quantity-btn.plus');
            const quantityInput = quantitySelector.querySelector('.quantity-input');

            if (minusBtn && plusBtn && quantityInput) {
                const minQty = 1;
                const maxQty = 10; // Максимальное количество для заказа

                minusBtn.addEventListener('click', function() {
                    let value = parseInt(quantityInput.value);
                    if (value > minQty) {
                        quantityInput.value = value - 1;
                    }
                });

                plusBtn.addEventListener('click', function() {
                    let value = parseInt(quantityInput.value);
                    if (value < maxQty) {
                        quantityInput.value = value + 1;
                    } else {
                        alert(`Максимальное количество для заказа: ${maxQty} шт.`);
                    }
                });

                // Валидация при ручном вводе
                quantityInput.addEventListener('change', function() {
                    let value = parseInt(this.value);
                    if (isNaN(value) || value < minQty) {
                        this.value = minQty;
                    } else if (value > maxQty) {
                        this.value = maxQty;
                        alert(`Максимальное количество для заказа: ${maxQty} шт.`);
                    }
                });

                // Установка начального значения, если оно некорректно
                if (parseInt(quantityInput.value) < minQty || isNaN(parseInt(quantityInput.value))) {
                    quantityInput.value = minQty;
                }
            }
        }

        // 5. Добавление товара в корзину
        const addToCartBtn = document.querySelector('.add-to-cart-btn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', function() {
                // Собираем данные о товаре
                const productContainer = document.querySelector('.product-info'); // Родительский блок
                const productTitleElement = document.getElementById('product-title') || productContainer?.querySelector('h1');
                const productPriceElement = productContainer?.querySelector('.product-price');
                const activeSizeElement = document.querySelector('.size-options .size-btn.active'); // Ищем активный размер
                const activeColorElement = document.querySelector('.color-options .color-btn.active'); // Ищем активный цвет
                const quantityInputElement = document.querySelector('.quantity-selector .quantity-input');
                const mainImageElement = document.getElementById('current-image'); // Главное изображение для картинки в корзине

                // Валидация: все ли выбрано/найдено?
                if (!productTitleElement) { console.error("Не найден заголовок товара"); return; }
                if (!productPriceElement) { console.error("Не найдена цена товара"); return; }
                if (!activeSizeElement) { alert("Пожалуйста, выберите размер."); return; }
                if (!activeColorElement) { alert("Пожалуйста, выберите цвет."); return; } // Или определяем цвет иначе, если он один на странице
                if (!quantityInputElement) { console.error("Не найден ввод количества"); return; }
                if (!mainImageElement) { console.error("Не найдено изображение товара"); return; }

                const productTitle = productTitleElement.textContent.trim();
                const productPrice = productPriceElement.textContent.trim(); // Строка '5000 ₽'
                const productSize = activeSizeElement.getAttribute('data-size');
                const productColor = activeColorElement.getAttribute('data-color'); // 'blue' или 'brown'
                const productQuantity = parseInt(quantityInputElement.value);
                // Используем главное изображение как картинку для корзины
                const productImage = mainImageElement.src;
                 // Генерируем уникальный ID для комбинации товар-цвет-размер
                const productId = `${productTitle.replace(/\s+/g, '-')}-${productColor}-${productSize}`.toLowerCase();

                if (productQuantity < 1) { alert("Количество должно быть не меньше 1."); return; }

                // Создаем объект товара
                const product = {
                    id: productId,
                    title: productTitle,
                    price: productPrice, // Сохраняем как строку
                    size: productSize,
                    color: productColor,
                    quantity: productQuantity,
                    image: productImage
                };

                try {
                    // Получаем корзину из localStorage
                    let cart = JSON.parse(localStorage.getItem('cart')) || [];

                    // Ищем, есть ли уже такой товар (по ID)
                    const existingProductIndex = cart.findIndex(item => item.id === product.id);

                    if (existingProductIndex > -1) {
                        // Товар уже есть - обновляем количество
                        cart[existingProductIndex].quantity += product.quantity;
                        // Проверяем превышение максимума (например, 10)
                        if (cart[existingProductIndex].quantity > 10) {
                             alert(`Вы не можете добавить больше 10 шт. товара "${productTitle}" (${productColor}, ${productSize}) в корзину.`);
                             cart[existingProductIndex].quantity = 10;
                        }
                    } else {
                        // Товара нет - добавляем новый
                        cart.push(product);
                    }

                    // Сохраняем обновленную корзину
                    localStorage.setItem('cart', JSON.stringify(cart));

                    // Обновляем счетчик в шапке
                    updateCartCount();

                    // Сообщаем пользователю
                    alert(`"${productTitle}" (${productColor === 'blue' ? 'Синий' : 'Коричневый'}, ${productSize}) x ${productQuantity} шт. добавлен в корзину!`);

                } catch (e) {
                    console.error("Ошибка при работе с localStorage:", e);
                    alert("Произошла ошибка при добавлении товара в корзину.");
                }
            });
        }
    } // Конец блока if для страницы товара


    // --- ЛОГИКА ДЛЯ СТРАНИЦЫ КОРЗИНЫ (cart.html) ---
    // Определяем страницу корзины по наличию #cart-items
    const cartItemsContainer = document.getElementById('cart-items');
    if (cartItemsContainer) {
        const cartEmptyMessage = document.getElementById('cart-empty');
        const cartSummaryBlock = document.getElementById('cart-summary'); // Блок с итогами

        /**
         * Отрисовывает содержимое корзины на странице cart.html
         */
        function renderCartPage() {
            if (!cartItemsContainer || !cartEmptyMessage || !cartSummaryBlock) return; // Доп. проверка

            try {
                const cart = JSON.parse(localStorage.getItem('cart')) || [];

                if (cart.length === 0) {
                    // Показываем сообщение о пустой корзине
                    cartEmptyMessage.style.display = 'block';
                    cartItemsContainer.style.display = 'none';
                    cartSummaryBlock.style.display = 'none';
                } else {
                    // Показываем товары и итоги
                    cartEmptyMessage.style.display = 'none';
                    // Убедимся, что контейнер видимый и правильный display
                    cartItemsContainer.style.display = 'grid'; // или 'block', в зависимости от твоих стилей
                    cartSummaryBlock.style.display = 'block';

                    cartItemsContainer.innerHTML = ''; // Очищаем перед заполнением
                    let totalCartPrice = 0;

                    // Создаем элементы для каждого товара
                    cart.forEach((item, index) => {
                        const priceValue = parseInt(item.price?.replace(/\D/g, '')) || 0; // Безопасное получение цены
                        const itemQuantity = parseInt(item.quantity) || 0; // Безопасное получение кол-ва
                        const itemTotalPrice = priceValue * itemQuantity;
                        totalCartPrice += itemTotalPrice;

                        const cartItemElement = document.createElement('div');
                        cartItemElement.className = 'cart-item';
                        cartItemElement.setAttribute('data-id', item.id); // Добавляем ID для возможного использования
                        cartItemElement.innerHTML = `
                            <img src="${item.image}" alt="${item.title}" class="cart-item-image" onerror="this.src='images/placeholder.png'; this.alt='Изображение недоступно'"> <!-- Добавил onerror -->
                            <div class="cart-item-details">
                                <h3>${item.title || 'Без названия'}</h3>
                                <p>Цвет: ${item.color === 'blue' ? 'Синий' : (item.color === 'brown' ? 'Коричневый' : item.color || 'Не указан')}</p>
                                <p>Размер: ${item.size || 'Не указан'}</p>
                                <p class="cart-item-price">Цена: ${item.price || '0 ₽'}</p>
                            </div>
                            <div class="cart-item-quantity">
                                <button class="quantity-btn minus" data-index="${index}" aria-label="Уменьшить количество">-</button>
                                <!-- Используем уникальный класс для инпута в корзине -->
                                <input type="number" class="quantity-input cart-quantity-input" value="${itemQuantity}" min="1" max="10" data-index="${index}" aria-label="Количество">
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

                    // Обновляем итоговую сумму в блоке сводки корзины
                    const cartTotalPriceElement = cartSummaryBlock.querySelector('.total-price');
                    if (cartTotalPriceElement) {
                        cartTotalPriceElement.textContent = `${totalCartPrice} ₽`;
                    }

                }
            } catch (e) {
                console.error("Ошибка при отрисовке корзины:", e);
                cartItemsContainer.innerHTML = '<p>Произошла ошибка при загрузке корзины.</p>';
                cartEmptyMessage.style.display = 'none';
                 cartSummaryBlock.style.display = 'none';
            }
        }

        /**
         * Добавляет обработчики событий для кнопок +/-/удалить и инпута количества в корзине.
         * Использует делегирование событий.
         */
        function addCartActionHandlers() {
             if (!cartItemsContainer) return;

             cartItemsContainer.addEventListener('click', function(event) {
                 const target = event.target;
                 const cartItemElement = target.closest('.cart-item'); // Находим родительский элемент товара
                 if (!cartItemElement) return; // Клик вне элемента товара

                 const index = parseInt(target.closest('[data-index]')?.getAttribute('data-index'));

                 if (isNaN(index)) return; // Не удалось определить индекс

                 try {
                     let cart = JSON.parse(localStorage.getItem('cart')) || [];
                     if (index < 0 || index >= cart.length) { console.error("Неверный индекс товара"); return; } // Проверка индекса
                     const currentItem = cart[index];

                     // Обработка кнопок +/-
                     if (target.classList.contains('quantity-btn') || target.closest('.quantity-btn')) {
                          const button = target.closest('.quantity-btn');
                          let quantityChanged = false;
                          if (button.classList.contains('minus')) {
                              if (currentItem.quantity > 1) {
                                  currentItem.quantity--;
                                  quantityChanged = true;
                              } else {
                                  // Предлагаем удалить при уменьшении с 1
                                  if (confirm(`Удалить "${currentItem.title}" из корзины?`)) {
                                      cart.splice(index, 1);
                                      quantityChanged = true;
                                  }
                              }
                          } else if (button.classList.contains('plus')) {
                               if (currentItem.quantity < 10) { // Ограничение
                                  currentItem.quantity++;
                                  quantityChanged = true;
                               } else {
                                    alert("Достигнут максимум (10 шт.) для этого товара.");
                               }
                          }
                          // Если изменили корзину, сохраняем и перерисовываем
                          if (quantityChanged) {
                              localStorage.setItem('cart', JSON.stringify(cart));
                              renderCartPage(); // Перерисовываем всю корзину
                              updateCartCount(); // Обновляем счетчик в шапке
                          }
                     }
                     // Обработка кнопки удаления
                     else if (target.classList.contains('cart-item-remove') || target.closest('.cart-item-remove')) {
                          if (confirm(`Удалить "${currentItem.title}" из корзины?`)) {
                              cart.splice(index, 1); // Удаляем товар из массива
                              localStorage.setItem('cart', JSON.stringify(cart)); // Сохраняем
                              renderCartPage(); // Перерисовываем
                              updateCartCount(); // Обновляем счетчик
                          }
                     }
                 } catch (e) {
                     console.error("Ошибка при обработке действия в корзине:", e);
                 }
             });

             // Обработчик изменения количества через input
             cartItemsContainer.addEventListener('change', function(event) {
                 const target = event.target;
                 if (target.classList.contains('cart-quantity-input')) {
                     const input = target;
                     const index = parseInt(input.getAttribute('data-index'));
                     let newQuantity = parseInt(input.value);

                      if (isNaN(index)) return;

                      try {
                           let cart = JSON.parse(localStorage.getItem('cart')) || [];
                           if (index < 0 || index >= cart.length) { console.error("Неверный индекс товара"); return; }
                           const currentItem = cart[index];

                           // Валидация введенного значения
                           let quantityChanged = false;
                           if (isNaN(newQuantity) || newQuantity < 1) {
                               if (confirm(`Количество не может быть меньше 1. Удалить "${currentItem.title}" из корзины?`)) {
                                    cart.splice(index, 1);
                                    quantityChanged = true;
                               } else {
                                    input.value = currentItem.quantity; // Возвращаем старое значение
                               }
                           } else if (newQuantity > 10) { // Ограничение
                                alert("Максимум 10 шт. для одного товара.");
                                newQuantity = 10;
                                input.value = newQuantity;
                                if (currentItem.quantity !== newQuantity) {
                                    currentItem.quantity = newQuantity;
                                    quantityChanged = true;
                                }
                           } else {
                               // Обновляем количество, если оно изменилось
                               if (currentItem.quantity !== newQuantity) {
                                    currentItem.quantity = newQuantity;
                                    quantityChanged = true;
                               }
                           }

                           // Если изменили корзину, сохраняем и перерисовываем
                           if (quantityChanged) {
                               localStorage.setItem('cart', JSON.stringify(cart));
                               renderCartPage();
                               updateCartCount();
                           }
                      } catch (e) {
                          console.error("Ошибка при изменении количества в корзине:", e);
                      }
                 }
             });
        }

        // Первичная отрисовка корзины и установка обработчиков
        renderCartPage();
        addCartActionHandlers();

    } // Конец блока if для страницы корзины


    // --- ЛОГИКА ДЛЯ СТРАНИЦЫ ОФОРМЛЕНИЯ ЗАКАЗА (checkout.html) ---
    // Определяем страницу по наличию формы #order-form
    const checkoutForm = document.getElementById('order-form');
    if (checkoutForm) {
        const checkoutItemsContainer = document.querySelector('.order-summary #order-items');
        const checkoutSummaryItemsPrice = document.querySelector('.order-summary .items-price');
        const checkoutSummaryDeliveryPrice = document.querySelector('.order-summary .delivery-price');
        const checkoutSummaryTotalPrice = document.querySelector('.order-summary .total-price');
        const checkoutDetailsInput = document.getElementById('order-details-input'); // Скрытое поле
        const checkoutFormStatusEl = document.getElementById('form-status'); // Статус отправки
        const checkoutSubmitButton = checkoutForm.querySelector('.submit-order-btn');

        // Проверка наличия всех необходимых элементов
        if (!checkoutItemsContainer || !checkoutSummaryItemsPrice || !checkoutSummaryDeliveryPrice || !checkoutSummaryTotalPrice || !checkoutDetailsInput || !checkoutSubmitButton) {
            console.error("Не все элементы для страницы оформления заказа найдены!");
        } else {

            /**
             * Отображает сводку заказа, рассчитывает итоги и заполняет скрытое поле.
             */
            function displayCheckoutSummary() {
                try {
                    const cart = JSON.parse(localStorage.getItem('cart')) || [];
                    let itemsHtml = '';
                    let itemsTotalPrice = 0;
                    // Начинаем формирование текста для скрытого поля (для отправки)
                    let orderDetailsText = "--- Состав заказа ---\n\n";

                    if (cart.length === 0) {
                        checkoutItemsContainer.innerHTML = '<p>Ваша корзина пуста. Добавьте товары перед оформлением.</p>';
                        checkoutSubmitButton.disabled = true; // Блокируем кнопку
                        checkoutSubmitButton.style.opacity = '0.6';
                        checkoutSubmitButton.style.cursor = 'not-allowed';
                        // Обнуляем итоги
                        checkoutSummaryItemsPrice.textContent = `0 ₽`;
                        checkoutSummaryDeliveryPrice.textContent = `0 ₽`;
                        checkoutSummaryTotalPrice.textContent = `0 ₽`;
                        checkoutDetailsInput.value = "Корзина пуста";
                        return; // Выходим
                    } else {
                        // Разблокируем кнопку, если корзина не пуста
                        checkoutSubmitButton.disabled = false;
                         checkoutSubmitButton.style.opacity = '1';
                        checkoutSubmitButton.style.cursor = 'pointer';
                    }

                    // Перебираем товары в корзине
                    cart.forEach(item => {
                        const priceValue = parseInt(item.price?.replace(/\D/g, '')) || 0;
                        const itemQuantity = parseInt(item.quantity) || 0;
                        const itemTotal = priceValue * itemQuantity;
                        itemsTotalPrice += itemTotal;

                        // Формируем HTML для отображения в сводке
                        itemsHtml += `
                            <div class="order-item">
                                <span>${item.title || 'Товар'} (${item.color === 'blue' ? 'Синий' : 'Коричневый'}, ${item.size || 'N/A'}) x ${itemQuantity}</span>
                                <span>${itemTotal} ₽</span>
                            </div>
                        `;
                        // Дополняем текст для скрытого поля
                        orderDetailsText += `Товар: ${item.title || 'Товар'}\n`;
                        orderDetailsText += `  Цвет: ${item.color === 'blue' ? 'Синий' : (item.color === 'brown' ? 'Коричневый' : item.color || 'N/A')}, Размер: ${item.size || 'N/A'}\n`;
                        orderDetailsText += `  Кол-во: ${itemQuantity} x ${item.price || '0 ₽'} = ${itemTotal} ₽\n\n`;
                    });

                    checkoutItemsContainer.innerHTML = itemsHtml; // Вставляем HTML в сводку

                    // Расчет стоимости доставки
                    let deliveryPrice = 0;
                    let deliveryMethod = "Не выбран";
                    const selectedDeliveryRadio = document.querySelector('input[name="delivery"]:checked');
                    if (selectedDeliveryRadio) {
                        deliveryMethod = selectedDeliveryRadio.value || "Не указан";
                        // Получаем базовую цену доставки из data-атрибута
                        deliveryPrice = parseInt(selectedDeliveryRadio.getAttribute('data-price')) || 0;
                    }

                    // Применяем правило бесплатной доставки
                    const freeDeliveryThreshold = 5000;
                    let finalDeliveryPrice = deliveryPrice; // Цена, которая пойдет в итог
                    let deliveryText = `${deliveryPrice} ₽`; // Текст для отображения

                    if (itemsTotalPrice >= freeDeliveryThreshold && deliveryPrice > 0) {
                        finalDeliveryPrice = 0;
                        deliveryText = `0 ₽ (Бесплатно от ${freeDeliveryThreshold} ₽)`;
                    } else if (deliveryPrice === 0 && deliveryMethod === 'Пункт выдачи (Самовывоз)') {
                        deliveryText = `0 ₽ (Самовывоз)`;
                    } else if (deliveryPrice === 0) {
                         deliveryText = `0 ₽`; // Если цена 0, но это не самовывоз
                    }
                    // ---

                    const finalTotalPrice = itemsTotalPrice + finalDeliveryPrice;

                    // Обновляем отображение итогов
                    checkoutSummaryItemsPrice.textContent = `${itemsTotalPrice} ₽`;
                    checkoutSummaryDeliveryPrice.textContent = deliveryText;
                    checkoutSummaryTotalPrice.textContent = `${finalTotalPrice} ₽`;

                    // Формируем окончательный текст для скрытого поля
                    orderDetailsText += `--- Итоги ---\n`;
                    orderDetailsText += `Стоимость товаров: ${itemsTotalPrice} ₽\n`;
                    orderDetailsText += `Способ доставки: ${deliveryMethod}\n`;
                    orderDetailsText += `Стоимость доставки: ${finalDeliveryPrice} ₽ ${deliveryPrice !== finalDeliveryPrice ? '(Изначально '+deliveryPrice+' ₽)' : ''}\n`;
                    const selectedPaymentRadio = document.querySelector('input[name="payment"]:checked');
                    const paymentMethod = selectedPaymentRadio ? selectedPaymentRadio.value : "Не выбран";
                    orderDetailsText += `Способ оплаты: ${paymentMethod}\n`;
                    orderDetailsText += `Общая сумма заказа: ${finalTotalPrice} ₽\n`;
                    orderDetailsText += `------------------`;
                    checkoutDetailsInput.value = orderDetailsText; // Записываем в скрытое поле

                } catch (e) {
                     console.error("Ошибка при отображении сводки заказа:", e);
                     checkoutItemsContainer.innerHTML = '<p>Ошибка загрузки сводки.</p>';
                }
            }

            // Вызываем функцию отрисовки сводки при загрузке страницы
            displayCheckoutSummary();

            // Добавляем слушатель на изменение способа доставки для пересчета
            document.querySelectorAll('input[name="delivery"]').forEach(radio => {
                radio.addEventListener('change', displayCheckoutSummary);
            });

            // --- ОБРАБОТЧИК ОТПРАВКИ ФОРМЫ ОФОРМЛЕНИЯ ЗАКАЗА ЧЕРЕЗ AJAX ---
            checkoutForm.addEventListener('submit', function(event) {
                event.preventDefault(); // Отменяем стандартное поведение формы

                // Проверка валидности HTML5 полей
                if (!checkoutForm.checkValidity()) {
                    if (checkoutFormStatusEl) {
                        checkoutFormStatusEl.textContent = 'Пожалуйста, заполните все обязательные поля, отмеченные *.';
                        checkoutFormStatusEl.style.color = 'red';
                    }
                    // Заставляем браузер показать стандартные подсказки валидации
                    checkoutForm.reportValidity();
                    return; // Прерываем отправку
                }

                // Убедимся, что скрытое поле с деталями заказа заполнено актуальными данными
                displayCheckoutSummary();

                const formData = new FormData(checkoutForm); // Собираем все данные формы
                const formActionUrl = 'https://formspree.io/f/mqapnrgw'; // ВАШ URL FORMSPREE ЗДЕСЬ

                // Меняем интерфейс на время отправки
                if (checkoutFormStatusEl) {
                    checkoutFormStatusEl.textContent = 'Отправка заказа...';
                    checkoutFormStatusEl.style.color = 'inherit'; // Сбрасываем цвет ошибки
                }
                if (checkoutSubmitButton) checkoutSubmitButton.disabled = true;

                // Отправляем данные с помощью fetch API
                fetch(formActionUrl, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json' // Обязательно для AJAX отправки на Formspree
                    }
                })
                .then(response => {
                    // Проверяем, успешен ли ответ сервера (статус 2xx)
                    if (response.ok) {
                        if (checkoutFormStatusEl) {
                            checkoutFormStatusEl.textContent = 'Заказ успешно отправлен!';
                            checkoutFormStatusEl.style.color = 'green';
                        }
                        console.log('Заказ успешно отправлен через AJAX на Formspree');

                        // Очищаем корзину ПОСЛЕ успешной отправки
                        try {
                            localStorage.removeItem('cart');
                            console.log('Корзина очищена после успешного заказа.');
                            updateCartCount(); // Обновляем счетчик в шапке
                        } catch (e) {
                            console.error("Ошибка при очистке корзины после заказа:", e);
                            // Не критично, пользователь все равно перейдет на thank_you
                        }

                        // Перенаправляем пользователя на страницу благодарности через небольшую задержку
                        setTimeout(() => {
                             // Убедитесь, что файл thank_you.html существует и путь к нему верный
                            window.location.href = 'thank_you.html';
                        }, 1500); // Задержка 1.5 секунды

                    } else {
                        // Сервер Formspree вернул ошибку (статус не 2xx)
                        response.json().then(data => {
                            // Пытаемся получить текст ошибки от Formspree
                            const errorMsg = data?.errors?.map(e => e.message).join(', ') || 'Не удалось получить детали ошибки.';
                            console.error('Ошибка отправки формы (сервер):', data);
                             if (checkoutFormStatusEl) {
                                 checkoutFormStatusEl.textContent = `Ошибка отправки: ${errorMsg}`;
                                 checkoutFormStatusEl.style.color = 'red';
                             }
                        }).catch(() => {
                            // Если ответ сервера не JSON
                             console.error('Ошибка отправки формы (сервер), не JSON:', response.status, response.statusText);
                             if (checkoutFormStatusEl) {
                                 checkoutFormStatusEl.textContent = `Ошибка сервера (${response.status}). Попробуйте еще раз позже.`;
                                 checkoutFormStatusEl.style.color = 'red';
                             }
                        }).finally(() => {
                             if (checkoutSubmitButton) checkoutSubmitButton.disabled = false; // Разблокируем кнопку при ошибке сервера
                        });
                    }
                })
                .catch(error => {
                    // Ошибка сети (нет интернета, сервер недоступен и т.д.)
                    console.error('Ошибка сети при отправке формы:', error);
                     if (checkoutFormStatusEl) {
                         checkoutFormStatusEl.textContent = 'Ошибка сети. Проверьте подключение и попробуйте снова.';
                         checkoutFormStatusEl.style.color = 'red';
                     }
                     if (checkoutSubmitButton) checkoutSubmitButton.disabled = false; // Разблокируем кнопку при ошибке сети
                });
            });

        } // Конец else (если все элементы найдены)
    } // Конец блока if для страницы checkout


    // --- ЛОГИКА ДЛЯ СТРАНИЦЫ КАТАЛОГА (catalog.html) ---
    // Определяем страницу по наличию сетки товаров и фильтров
    const productsGrid = document.querySelector('.products-grid');
    const filterButtonsContainer = document.querySelector('.catalog .filters .filter-options'); // Уточнили селектор

    if (productsGrid && filterButtonsContainer) {
        const productCards = productsGrid.querySelectorAll('.product-card');
        const filterButtons = filterButtonsContainer.querySelectorAll('.filter-btn');

        /**
         * Фильтрует товары в каталоге по значению data-color.
         * @param {string} filterValue - Значение фильтра ('all', 'blue', 'brown' и т.д.)
         */
        function filterProducts(filterValue) {
            let visibleCount = 0;
            productCards.forEach(card => {
                const cardColor = card.getAttribute('data-color');
                // Показываем товар если:
                // 1. Фильтр 'all' ИЛИ
                // 2. У товара нет data-color ИЛИ
                // 3. Цвет товара совпадает с фильтром
                const shouldShow = filterValue === 'all' || !cardColor || cardColor === filterValue;

                card.style.display = shouldShow ? 'block' : 'none'; // Используем block, т.к. карточки - блочные элементы grid
                if (shouldShow) visibleCount++;
            });

            // Обновляем активную кнопку фильтра
            filterButtons.forEach(btn => {
                 btn.classList.toggle('active', btn.getAttribute('data-filter') === filterValue);
            });

            // Можно добавить сообщение, если ничего не найдено
             const noResultsMessage = document.getElementById('catalog-no-results'); // Нужен <p id="catalog-no-results"></p> где-то
            if (noResultsMessage) {
                noResultsMessage.style.display = visibleCount === 0 ? 'block' : 'none';
                noResultsMessage.textContent = `Товары с фильтром "${filterValue}" не найдены.`;
            }
        }

        // Добавляем обработчики на кнопки фильтров
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                const filterValue = this.getAttribute('data-filter'); // 'all', 'blue', 'brown'
                filterProducts(filterValue);

                // Опционально: Обновляем URL для сохранения фильтра (без перезагрузки)
                // const url = new URL(window.location);
                // if (filterValue && filterValue !== 'all') {
                //     url.searchParams.set('color', filterValue);
                // } else {
                //     url.searchParams.delete('color');
                // }
                // window.history.pushState({ path: url.toString() }, '', url.toString());
            });
        });

        // Применяем фильтр при загрузке страницы, если он есть в параметрах URL
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const initialColorFilter = urlParams.get('color') || 'all'; // 'all' по умолчанию
            filterProducts(initialColorFilter);
        } catch (e) {
            console.error("Ошибка при применении начального фильтра каталога:", e);
             filterProducts('all'); // Показываем все по умолчанию при ошибке
        }
    } // Конец блока if для страницы каталога


    // --- ДРУГИЕ СКРИПТЫ САЙТА ---

    // Слайдер отзывов (если есть на странице .testimonials-slider)
    const testimonialsSlider = document.querySelector('.testimonials-slider');
    if (testimonialsSlider) {
        const testimonials = testimonialsSlider.querySelectorAll('.testimonial-item');
        const prevBtn = document.querySelector('.slider-controls .slider-prev');
        const nextBtn = document.querySelector('.slider-controls .slider-next');

        if (testimonials.length > 1 && prevBtn && nextBtn) { // Работает только если больше 1 отзыва
            let currentSlide = 0;
            const totalSlides = testimonials.length;

            // Показываем нужный слайд (простой вариант - через display)
            function showSlide(index) {
                testimonials.forEach((slide, i) => {
                    slide.style.display = (i === index) ? 'block' : 'none';
                });
                 currentSlide = index;
            }

            // Обработчики кнопок
            prevBtn.addEventListener('click', function() {
                const newIndex = (currentSlide - 1 + totalSlides) % totalSlides;
                showSlide(newIndex);
            });
            nextBtn.addEventListener('click', function() {
                const newIndex = (currentSlide + 1) % totalSlides;
                showSlide(newIndex);
            });

            // Показываем первый слайд при загрузке
            showSlide(0);
        } else if (testimonials.length === 1 && prevBtn && nextBtn) {
             // Если отзыв только один, скрываем кнопки управления
             prevBtn.style.display = 'none';
             nextBtn.style.display = 'none';
        }
    }

    // Форма контактов (если она использует Formspree и AJAX)
    const contactForm = document.getElementById('contact-form'); // Предполагаем ID формы
    if (contactForm && contactForm.getAttribute('action')?.includes('formspree')) {
        const contactFormStatus = document.getElementById('contact-form-status'); // Элемент для статуса
        const contactSubmitBtn = contactForm.querySelector('button[type="submit"]');

        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(contactForm);
            const formAction = contactForm.getAttribute('action');
            if (!formAction) { console.error("Action не указан для формы контактов"); return; }

            if (contactFormStatus) contactFormStatus.textContent = "Отправка...";
            if (contactSubmitBtn) contactSubmitBtn.disabled = true;

            fetch(formAction, {
                method: "POST",
                body: formData,
                headers: {'Accept': 'application/json'}
            })
            .then(response => {
                if (response.ok) {
                     if (contactFormStatus) contactFormStatus.textContent = "Сообщение успешно отправлено!";
                     contactForm.reset(); // Очищаем форму
                     // Можно скрыть форму и показать блок "Спасибо"
                     // const formSuccessBlock = document.getElementById('form-success');
                     // if (formSuccessBlock) {
                     //     contactForm.style.display = 'none';
                     //     formSuccessBlock.style.display = 'block';
                     // }
                } else {
                    response.json().then(data => {
                        const error = data?.errors?.map(e => e.message).join(", ") || "Неизвестная ошибка";
                        if (contactFormStatus) contactFormStatus.textContent = `Ошибка: ${error}`;
                    }).catch(() => {
                         if (contactFormStatus) contactFormStatus.textContent = "Ошибка отправки.";
                    });
                }
            })
            .catch(error => {
                 if (contactFormStatus) contactFormStatus.textContent = "Ошибка сети.";
                 console.error("Contact form network error:", error);
            })
            .finally(() => {
                 if (contactSubmitBtn) contactSubmitBtn.disabled = false;
            });
        });
    }

}); // --- КОНЕЦ ГЛАВНОГО DOMContentLoaded ---
