const swiper = new Swiper(".swiper", {
	direction: "horizontal",
	loop: true,
	effect: "cube",
	cubeEffect: {
		slideShadows: false
	},

	autoplay: {
		delay: 4000
	},

	pagination: {
		el: ".swiper-pagination"
	},

	navigation: {
		nextEl: ".swiper-button-next",
		prevEl: ".swiper-button-prev"
	}
});

// ============================================
// CONFIGURACIÓN Y VARIABLES GLOBALES
// ============================================

// URL base de la API
const API_BASE_URL = '/api';

// Variables globales para almacenar datos
let allProducts = [];
let filteredProducts = [];
let swiperInstances = [];
let currentCategory = 'all';
let isLoading = false;

// Cache para optimizar peticiones
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// ============================================
// FUNCIONES DE UTILIDAD
// ============================================

// Función para hacer peticiones HTTP
async function fetchAPI(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
        console.log(`🌐 Fetching: ${url}`);
        
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Error en la respuesta del servidor');
        }

        return data;
    } catch (error) {
        console.error(`❌ Error en petición a ${url}:`, error);
        throw error;
    }
}

// Función para obtener datos del cache
function getCachedData(key) {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log(`📦 Usando cache para: ${key}`);
        return cached.data;
    }
    return null;
}

// Función para guardar en cache
function setCachedData(key, data) {
    cache.set(key, {
        data,
        timestamp: Date.now()
    });
}

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
    // Remover notificación anterior
    const existing = document.getElementById('notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.id = 'notification';
    
    const colors = {
        success: '#4CAF50',
        error: '#f44336',
        warning: '#ff9800',
        info: '#2196F3'
    };

    notification.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type] || colors.info};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            max-width: 350px;
            font-family: inherit;
            animation: slideIn 0.3s ease-out;
        ">
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <span>${message}</span>
                <button onclick="this.closest('#notification').remove()" style="
                    background: none;
                    border: none;
                    color: white;
                    font-size: 20px;
                    cursor: pointer;
                    margin-left: 15px;
                    padding: 0;
                    width: 24px;
                    height: 24px;
                ">&times;</button>
            </div>
        </div>
    `;

    document.body.appendChild(notification);

    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Función para mostrar/ocultar spinner de carga
function toggleLoadingSpinner(show = true) {
    const existingSpinner = document.getElementById('loading-spinner');
    
    if (!show && existingSpinner) {
        existingSpinner.remove();
        return;
    }
    
    if (show && !existingSpinner) {
        const spinner = document.createElement('div');
        spinner.id = 'loading-spinner';
        spinner.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.9);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                backdrop-filter: blur(2px);
            ">
                <div style="
                    text-align: center;
                    padding: 30px;
                    background: white;
                    border-radius: 15px;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.1);
                ">
                    <div style="
                        width: 50px;
                        height: 50px;
                        border: 4px solid #f3f3f3;
                        border-top: 4px solid #0080ff;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        margin: 0 auto 20px;
                    "></div>
                    <p style="margin: 0; color: #666; font-size: 16px;">Cargando productos...</p>
                </div>
            </div>
        `;
        document.body.appendChild(spinner);
        
        // Agregar estilos de animación si no existen
        if (!document.getElementById('spinner-styles')) {
            const style = document.createElement('style');
            style.id = 'spinner-styles';
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// ============================================
// FUNCIONES DE API
// ============================================

// Obtener todos los productos
async function loadAllProducts() {
    const cacheKey = 'all-products';
    const cached = getCachedData(cacheKey);
    
    if (cached) {
        return cached;
    }

    try {
        const response = await fetchAPI('/products');
        const products = response.data;
        setCachedData(cacheKey, products);
        return products;
    } catch (error) {
        console.error('Error cargando todos los productos:', error);
        throw error;
    }
}

// Obtener productos por categoría
async function loadProductsByCategory(category) {
    const cacheKey = `products-${category}`;
    const cached = getCachedData(cacheKey);
    
    if (cached) {
        return cached;
    }

    try {
        const response = await fetchAPI(`/products/category/${category}`);
        const products = response.data;
        setCachedData(cacheKey, products);
        return products;
    } catch (error) {
        console.error(`Error cargando productos de ${category}:`, error);
        throw error;
    }
}

// Buscar productos
async function searchProducts(query) {
    if (!query || query.trim().length < 2) {
        throw new Error('La búsqueda debe tener al menos 2 caracteres');
    }

    try {
        const response = await fetchAPI(`/products/search?q=${encodeURIComponent(query)}`);
        return response.data;
    } catch (error) {
        console.error('Error buscando productos:', error);
        throw error;
    }
}

// Obtener producto por ID
async function getProductById(id) {
    const cacheKey = `product-${id}`;
    const cached = getCachedData(cacheKey);
    
    if (cached) {
        return cached;
    }

    try {
        const response = await fetchAPI(`/products/${id}`);
        const product = response.data;
        setCachedData(cacheKey, product);
        return product;
    } catch (error) {
        console.error(`Error obteniendo producto ${id}:`, error);
        throw error;
    }
}

// ============================================
// FUNCIONES DE RENDERIZADO
// ============================================

// Función principal para cargar y mostrar productos
async function initializeProducts() {
    if (isLoading) return;
    
    isLoading = true;
    toggleLoadingSpinner(true);
    
    try {
        console.log('🚀 Inicializando productos...');
        
        // Cargar todos los productos
        allProducts = await loadAllProducts();
        console.log(`✅ ${allProducts.length} productos cargados`);
        
        // Agrupar por categorías
        const productsByCategory = {
            abrigos: allProducts.filter(p => p.category === 'abrigos'),
            pantalones: allProducts.filter(p => p.category === 'pantalones'),
            accesorios: allProducts.filter(p => p.category === 'accesorios')
        };
        
        // Renderizar cada categoría
        await renderCategoryProducts('Abrigos', productsByCategory.abrigos);
        await renderCategoryProducts('Pantalones', productsByCategory.pantalones);
        await renderCategoryProducts('Accesorios', productsByCategory.accesorios);
        
        // Inicializar Swiper después de renderizar
        setTimeout(() => {
            initializeSwiper();
            showNotification(`${allProducts.length} productos cargados exitosamente`, 'success');
        }, 200);
        
    } catch (error) {
        console.error('❌ Error inicializando productos:', error);
        showNotification('Error cargando productos. Intenta recargar la página.', 'error');
        showFallbackProducts();
    } finally {
        isLoading = false;
        toggleLoadingSpinner(false);
    }
}

// Renderizar productos de una categoría específica
async function renderCategoryProducts(categoryDisplayName, products) {
    try {
        const categorySection = findCategorySection(categoryDisplayName);
        if (!categorySection) {
            console.warn(`Sección no encontrada: ${categoryDisplayName}`);
            return;
        }

        const swiperWrapper = categorySection.querySelector('.swiper-wrapper');
        if (!swiperWrapper) {
            console.warn(`Swiper wrapper no encontrado en: ${categoryDisplayName}`);
            return;
        }

        // Limpiar contenido anterior
        swiperWrapper.innerHTML = '';

        if (!products || products.length === 0) {
            renderEmptyCategory(swiperWrapper);
            return;
        }

        // Crear slides para cada producto
        products.forEach(product => {
            const slide = createProductSlide(product);
            swiperWrapper.appendChild(slide);
        });

        console.log(`✅ ${products.length} productos renderizados en ${categoryDisplayName}`);
        
    } catch (error) {
        console.error(`Error renderizando ${categoryDisplayName}:`, error);
    }
}

// Encontrar sección de categoría por nombre
function findCategorySection(categoryName) {
    const sections = document.querySelectorAll('section.categoria');
    
    for (const section of sections) {
        const h2 = section.querySelector('h2');
        if (h2 && h2.textContent.trim() === categoryName) {
            return section;
        }
    }
    
    return null;
}

// Renderizar categoría vacía
function renderEmptyCategory(container) {
    const emptySlide = document.createElement('div');
    emptySlide.className = 'swiper-slide';
    emptySlide.innerHTML = `
        <div class="details">
            <h3>Próximamente</h3>
            <p>Bs 0.00</p>
        </div>
        <div class="card-img">
            <div style="
                width: 100%;
                height: 250px;
                background: linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
                           linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
                           linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
                           linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
                background-size: 20px 20px;
                background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 10px;
                color: #999;
                font-size: 14px;
            ">
                Sin productos disponibles
            </div>
        </div>
    `;
    
    container.appendChild(emptySlide);
}

// Crear slide individual de producto
function createProductSlide(product) {
    const slide = document.createElement('div');
    slide.className = 'swiper-slide';
    slide.setAttribute('data-product-id', product.id);
    
    const formattedPrice = formatPrice(product.price);
    const stockStatus = getStockStatus(product.stock);
    
    slide.innerHTML = `
        <div class="details">
            <h3 title="${escapeHtml(product.name)}">${truncateText(product.name, 20)}</h3>
            <p>${formattedPrice}</p>
            ${stockStatus.show ? `<small style="color: ${stockStatus.color}; font-size: 10px;">${stockStatus.text}</small>` : ''}
        </div>
        <div class="card-img">
            <img 
                src="${product.image}" 
                alt="${escapeHtml(product.name)}" 
                loading="lazy" 
                onerror="handleImageError(this, '${escapeHtml(product.name)}')"
                style="cursor: pointer; transition: transform 0.2s ease;"
                onclick="showProductModal(${product.id})"
                onmouseover="this.style.transform='scale(1.05)'"
                onmouseout="this.style.transform='scale(1)'"
            >
            ${product.stock <= 5 ? '<div class="stock-badge">¡Últimas unidades!</div>' : ''}
        </div>
    `;
    
    return slide;
}

// ============================================
// FUNCIONES DE SWIPER
// ============================================

// Inicializar todos los swipers
function initializeSwiper() {
    // Destruir instancias anteriores
    destroySwiper();
    
    const swiperContainers = document.querySelectorAll('.swiper');
    console.log(`🎠 Inicializando ${swiperContainers.length} swipers`);
    
    swiperContainers.forEach((container, index) => {
        try {
            const swiper = new Swiper(container, {
                direction: 'horizontal',
                loop: true,
                effect: 'cube',
                cubeEffect: {
                    slideShadows: false,
                    shadow: true,
                    shadowOffset: 20,
                    shadowScale: 0.94
                },
                autoplay: {
                    delay: 4000 + (index * 500), // Diferente delay para cada swiper
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true
                },
                pagination: {
                    el: container.querySelector('.swiper-pagination'),
                    clickable: true,
                    dynamicBullets: true
                },
                navigation: {
                    nextEl: container.querySelector('.swiper-button-next'),
                    prevEl: container.querySelector('.swiper-button-prev')
                },
                keyboard: {
                    enabled: true
                },
                mousewheel: {
                    invert: false
                },
                on: {
                    slideChange: function() {
                        // Pausar autoplay de otros swipers cuando este está activo
                        swiperInstances.forEach(otherSwiper => {
                            if (otherSwiper !== this) {
                                otherSwiper.autoplay.stop();
                            }
                        });
                        
                        // Reanudar después de 2 segundos
                        setTimeout(() => {
                            swiperInstances.forEach(swiper => {
                                swiper.autoplay.start();
                            });
                        }, 2000);
                    }
                }
            });
            
            swiperInstances.push(swiper);
            console.log(`✅ Swiper ${index + 1} inicializado`);
            
        } catch (error) {
            console.error(`❌ Error inicializando swiper ${index + 1}:`, error);
        }
    });
}

// Destruir instancias de swiper
function destroySwiper() {
    swiperInstances.forEach((swiper, index) => {
        try {
            swiper.destroy(true, true);
            console.log(`🗑️ Swiper ${index + 1} destruido`);
        } catch (error) {
            console.error(`Error destruyendo swiper ${index + 1}:`, error);
        }
    });
    swiperInstances = [];
}

// ============================================
// FUNCIONES DE BÚSQUEDA
// ============================================

// Implementar búsqueda
async function handleSearch() {
    const query = prompt('🔍 ¿Qué producto estás buscando?');
    
    if (!query) return;
    
    if (query.trim().length < 2) {
        showNotification('La búsqueda debe tener al menos 2 caracteres', 'warning');
        return;
    }
    
    toggleLoadingSpinner(true);
    
    try {
        const results = await searchProducts(query);
        
        if (results.length === 0) {
            showNotification(`No se encontraron productos para "${query}"`, 'info');
            return;
        }
        
        showSearchResults(results, query);
        showNotification(`${results.length} productos encontrados para "${query}"`, 'success');
        
    } catch (error) {
        console.error('Error en búsqueda:', error);
        showNotification('Error realizando la búsqueda', 'error');
    } finally {
        toggleLoadingSpinner(false);
    }
}

// Mostrar resultados de búsqueda
function showSearchResults(products, query) {
    // Crear modal de resultados
    const modal = document.createElement('div');
    modal.id = 'search-results-modal';
    modal.innerHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            z-index: 10000;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
            box-sizing: border-box;
        " onclick="closeSearchResults()">
            <div style="
                background: white;
                border-radius: 15px;
                max-width: 800px;
                max-height: 80vh;
                overflow-y: auto;
                padding: 30px;
                position: relative;
            " onclick="event.stopPropagation()">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 style="margin: 0;">Resultados para "${escapeHtml(query)}"</h2>
                    <button onclick="closeSearchResults()" style="
                        background: none;
                        border: none;
                        font-size: 24px;
                        cursor: pointer;
                        width: 30px;
                        height: 30px;
                    ">&times;</button>
                </div>
                <div id="search-results-grid" style="
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 20px;
                ">
                    ${products.map(product => `
                        <div style="
                            border: 1px solid #eee;
                            border-radius: 10px;
                            padding: 15px;
                            text-align: center;
                            cursor: pointer;
                            transition: transform 0.2s ease;
                        " onclick="showProductModal(${product.id}); closeSearchResults();"
                           onmouseover="this.style.transform='translateY(-5px)'"
                           onmouseout="this.style.transform='translateY(0)'">
                            <img src="${product.image}" alt="${escapeHtml(product.name)}" style="
                                width: 100%;
                                height: 150px;
                                object-fit: cover;
                                border-radius: 8px;
                                margin-bottom: 10px;
                            " onerror="handleImageError(this, '${escapeHtml(product.name)}')">
                            <h4 style="margin: 0 0 10px 0; font-size: 14px;">${escapeHtml(product.name)}</h4>
                            <p style="margin: 0; color: #0080ff; font-weight: bold;">${formatPrice(product.price)}</p>
                            <p style="margin: 5px 0 0 0; font-size: 12px; color: #666; text-transform: capitalize;">${product.category}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Cerrar resultados de búsqueda
function closeSearchResults() {
    const modal = document.getElementById('search-results-modal');
    if (modal) {
        modal.remove();
    }
}

// ============================================
// FUNCIONES DE MODAL DE PRODUCTO
// ============================================

// Mostrar modal de producto
async function showProductModal(productId) {
    toggleLoadingSpinner(true);
    
    try {
        const product = await getProductById(productId);
        
        const modal = document.createElement('div');
        modal.id = 'product-modal';
        modal.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                z-index: 10000;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 20px;
                box-sizing: border-box;
            " onclick="closeProductModal()">
                <div style="
                    background: white;
                    border-radius: 15px;
                    max-width: 600px;
                    width: 100%;
                    max-height: 90vh;
                    overflow-y: auto;
                    position: relative;
                " onclick="event.stopPropagation()">
                    <button onclick="closeProductModal()" style="
                        position: absolute;
                        top: 15px;
                        right: 15px;
                        background: none;
                        border: none;
                        font-size: 24px;
                        cursor: pointer;
                        z-index: 1;
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: rgba(255,255,255,0.9);
                    ">&times;</button>
                    
                    <div style="padding: 30px;">
                        <div style="text-align: center; margin-bottom: 20px;">
                            <img src="${product.image}" alt="${escapeHtml(product.name)}" style="
                                max-width: 100%;
                                max-height: 300px;
                                object-fit: contain;
                                border-radius: 10px;
                                margin-bottom: 20px;
                            " onerror="handleImageError(this, '${escapeHtml(product.name)}')">
                        </div>
                        
                        <h2 style="margin: 0 0 10px 0; text-align: center;">${escapeHtml(product.name)}</h2>
                        <p style="text-align: center; font-size: 24px; color: #0080ff; font-weight: bold; margin: 0 0 15px 0;">
                            ${formatPrice(product.price)}
                        </p>
                        
                        <div style="display: flex; justify-content: space-between; margin-bottom: 20px; padding: 15px; background: #f9f9f9; border-radius: 8px;">
                            <div>
                                <strong>Categoría:</strong><br>
                                <span style="text-transform: capitalize;">${product.category}</span>
                            </div>
                            <div>
                                <strong>Stock:</strong><br>
                                <span style="color: ${product.stock > 10 ? '#4CAF50' : product.stock > 0 ? '#ff9800' : '#f44336'}">
                                    ${product.stock} ${product.stock === 1 ? 'unidad' : 'unidades'}
                                </span>
                            </div>
                        </div>
                        
                        ${product.description ? `
                            <div style="margin-bottom: 20px;">
                                <h4 style="margin: 0 0 10px 0;">Descripción:</h4>
                                <p style="margin: 0; line-height: 1.6; color: #666;">${escapeHtml(product.description)}</p>
                            </div>
                        ` : ''}
                        
                        <div style="text-align: center;">
                            <button onclick="addToCart(${product.id})" style="
                                background: #0080ff;
                                color: white;
                                border: none;
                                padding: 15px 30px;
                                border-radius: 8px;
                                font-size: 16px;
                                cursor: pointer;
                                margin-right: 10px;
                                transition: background 0.2s ease;
                            " onmouseover="this.style.background='#0066cc'" onmouseout="this.style.background='#0080ff'"
                               ${product.stock <= 0 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
                                ${product.stock <= 0 ? 'Sin Stock' : '🛒 Agregar al Carrito'}
                            </button>
                            <button onclick="closeProductModal()" style="
                                background: #6c757d;
                                color: white;
                                border: none;
                                padding: 15px 30px;
                                border-radius: 8px;
                                font-size: 16px;
                                cursor: pointer;
                                transition: background 0.2s ease;
                            " onmouseover="this.style.background='#545b62'" onmouseout="this.style.background='#6c757d'">
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
    } catch (error) {
        console.error('Error mostrando producto:', error);
        showNotification('Error cargando detalles del producto', 'error');
    } finally {
        toggleLoadingSpinner(false);
    }
}

// Cerrar modal de producto
function closeProductModal() {
    const modal = document.getElementById('product-modal');
    if (modal) {
        modal.remove();
    }
}

// ============================================
// FUNCIONES DE CARRITO (SIMULADO)
// ============================================

// Carrito en memoria (localStorage no disponible en artifacts)
let cart = [];

// Agregar al carrito
function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) {
        showNotification('Producto no encontrado', 'error');
        return;
    }
    
    if (product.stock <= 0) {
        showNotification('Producto sin stock', 'warning');
        return;
    }
    
    // Verificar si ya está en el carrito
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        if (existingItem.quantity >= product.stock) {
            showNotification('No hay más stock disponible', 'warning');
            return;
        }
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    updateCartUI();
    showNotification(`${product.name} agregado al carrito`, 'success');
    closeProductModal();
}

// Actualizar UI del carrito
function updateCartUI() {
    const cartButton = document.getElementById('btn-carrito');
    if (cartButton) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        // Agregar badge si no existe
        let badge = cartButton.querySelector('.cart-badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'cart-badge';
            badge.style.cssText = `
                position: absolute;
                top: -8px;
                right: -8px;
                background: #ff4444;
                color: white;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                font-size: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
            `;
            cartButton.style.position = 'relative';
            cartButton.appendChild(badge);
        }
        
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

// ============================================
// FUNCIONES DE UTILIDAD
// ============================================

// Formatear precio
function formatPrice(price) {
    return `Bs ${parseFloat(price).toFixed(2)}`;
}
