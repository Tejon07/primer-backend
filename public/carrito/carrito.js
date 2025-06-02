document.addEventListener('DOMContentLoaded', function() {
    // Menú móvil
    const openMenu = document.getElementById('open-menu');
    const closeMenu = document.getElementById('close-menu');
    const sidebar = document.getElementById('sidebar');
    
    openMenu.addEventListener('click', function() {
        sidebar.classList.add('active');
    });
    
    closeMenu.addEventListener('click', function() {
        sidebar.classList.remove('active');
    });
    
    // Simulación de carrito vacío/lleno (para demostración)
    const carritoVacio = document.getElementById('carrito-vacio');
    const carritoProductos = document.getElementById('carrito-productos');
    const carritoAcciones = document.getElementById('carrito-acciones');
    const carritoComprado = document.getElementById('carrito-comprado');
    
    // Para ver el estado vacío, cambiar a true
    const mostrarCarritoVacio = false;
    
    if (mostrarCarritoVacio) {
        carritoVacio.style.display = 'block';
        carritoProductos.style.display = 'none';
        carritoAcciones.style.display = 'none';
        carritoComprado.style.display = 'none';
    } else {
        carritoVacio.style.display = 'none';
        carritoProductos.style.display = 'block';
        carritoAcciones.style.display = 'flex';
        carritoComprado.style.display = 'none';
    }
    
    // Manejar botones de cantidad
    const botonesSumar = document.querySelectorAll('.sumar-cantidad');
    const botonesRestar = document.querySelectorAll('.restar-cantidad');
    const botonesEliminar = document.querySelectorAll('.carrito-producto-eliminar');
    
    botonesSumar.forEach(btn => {
        btn.addEventListener('click', function() {
            const span = this.previousElementSibling;
            let cantidad = parseInt(span.textContent);
            span.textContent = cantidad + 1;
            actualizarTotal();
        });
    });
    
    botonesRestar.forEach(btn => {
        btn.addEventListener('click', function() {
            const span = this.nextElementSibling;
            let cantidad = parseInt(span.textContent);
            if (cantidad > 1) {
                span.textContent = cantidad - 1;
                actualizarTotal();
            }
        });
    });
    
    botonesEliminar.forEach(btn => {
        btn.addEventListener('click', function() {
            const producto = this.closest('.carrito-producto');
            producto.style.animation = 'fadeOut 0.3s forwards';
            
            setTimeout(() => {
                producto.remove();
                if (document.querySelectorAll('.carrito-producto').length === 0) {
                    carritoVacio.style.display = 'block';
                    carritoProductos.style.display = 'none';
                    carritoAcciones.style.display = 'none';
                }
                actualizarTotal();
            }, 300);
        });
    });
    
    // Vaciar carrito
    const btnVaciar = document.getElementById('carrito-acciones-vaciar');
    btnVaciar.addEventListener('click', function() {
        Swal.fire({
            title: '¿Vaciar carrito?',
            text: "¿Estás seguro de que quieres eliminar todos los productos?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#73c6b6',
            cancelButtonColor: '#95a5a6',
            confirmButtonText: 'Sí, vaciar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                const productos = document.querySelectorAll('.carrito-producto');
                productos.forEach(producto => {
                    producto.style.animation = 'fadeOut 0.3s forwards';
                    setTimeout(() => producto.remove(), 300);
                });
                
                setTimeout(() => {
                    carritoVacio.style.display = 'block';
                    carritoProductos.style.display = 'none';
                    carritoAcciones.style.display = 'none';
                }, 350);
                
                Toastify({
                    text: "Carrito vaciado",
                    duration: 3000,
                    close: true,
                    gravity: "top",
                    position: "right",
                    backgroundColor: "#73c6b6",
                }).showToast();
            }
        });
    });
    
    // Comprar
    const btnComprar = document.getElementById('carrito-acciones-comprar');
    btnComprar.addEventListener('click', function() {
        Swal.fire({
            title: '¡Compra exitosa!',
            text: 'Gracias por tu compra. Tu pedido está en proceso.',
            icon: 'success',
            confirmButtonColor: '#27ae60',
        }).then(() => {
            const productos = document.querySelectorAll('.carrito-producto');
            productos.forEach(producto => producto.remove());
            
            carritoVacio.style.display = 'none';
            carritoProductos.style.display = 'none';
            carritoAcciones.style.display = 'none';
            carritoComprado.style.display = 'block';
        });
    });
    
    // Actualizar total
    function actualizarTotal() {
        let total = 0;
        document.querySelectorAll('.carrito-producto').forEach(producto => {
            const precioTexto = producto.querySelector('.carrito-producto-precio').textContent;
            const precio = parseFloat(precioTexto.replace('$', ''));
            const cantidad = parseInt(producto.querySelector('.carrito-producto-cantidad span').textContent);
            total += precio * cantidad;
        });
        
        document.getElementById('total').textContent = `$${total.toFixed(2)}`;
    }
});