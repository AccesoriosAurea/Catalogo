(function(){
    "use strict";

    console.log(productosData.anillos);        // Todos los anillos
    console.log(productosData.collares);       // Todos los collares
    console.log(productosData.pulseras);       // Todas las pulseras
    console.log(productosData.aretes); 
       
    // Variable global para el material seleccionado
    let materialSeleccionado = 'todos';

    // Variables de paginación
    const PRODUCTOS_POR_PAGINA = 8;
    let paginaActual = 1;
    let totalPaginas = 1;
    let productosFiltradosGlobal = []; // Para almacenar todos los productos filtrados
    // Variables de filtros
    let sexoSeleccionado = 'todos';  // 

    // Variables de busqueda
    let busquedaActiva = ''; // Código buscado
    let todosLosProductos = []; // Para búsqueda global

    // Lightbox
    let imagenesGaleria = [];
    let imagenActualIndex = 0;

    // Inicializar todosLosProductos al cargar
    function inicializarTodosLosProductos() {
      todosLosProductos = [];
      Object.keys(productosData).forEach(categoria => {
        productosData[categoria].forEach(producto => {
          todosLosProductos.push({
            ...producto,
            categoriaOriginal: categoria
          });
        });
      });
    }
    

    // 2. FUNCIÓN PARA ACTUALIZAR INFO DE RESULTADOS
    function actualizarInfoResultados(cantidad, categoria) {
      const infoDiv = document.getElementById('resultadosInfo');
      if (!infoDiv) return;
      
      const catNombre = {
        'anillos': 'Anillos',
        'collares': 'Collares',
        'pulseras': 'Pulseras',
        'aretes': 'Aretes',
        'earcuffs': 'Earcuffs'  
      }[categoria] || categoria;
      
      let filtrosActivos = [];
      
      if (materialSeleccionado !== 'todos') {
        const materialNombre = {
          'acero': 'Acero Inoxidable',
          'rodio': 'Rodio',
          'oro laminado': 'Oro Laminado',
          'oro 18k': 'Oro 18k',
          'plata 925': 'Plata 925',
          'plastico': 'Plastico' 
        }[materialSeleccionado] || materialSeleccionado;
        filtrosActivos.push(materialNombre);
      }
      
      if (sexoSeleccionado !== 'todos') {
        const sexoNombre = {
          'F': 'Femenino',
          'M': 'Masculino',
          'A': 'Niña',
          'O': 'Niño'
        }[sexoSeleccionado];
        filtrosActivos.push(sexoNombre);
      }
      
      let mensaje = `<i class="fas fa-tag"></i> ${cantidad} productos en ${catNombre}`;
      if (filtrosActivos.length > 0) {
        mensaje += ` · Filtros: ${filtrosActivos.join(' + ')}`;
      }
      
      infoDiv.innerHTML = mensaje;
    }

// 3. FUNCIÓN PARA CAMBIAR FILTRO DE MATERIAL
function cambiarFiltroMaterial(material) {
  materialSeleccionado = material;
  
  // Actualizar botones activos
  document.querySelectorAll('.material-btn').forEach(btn => {
    if (btn.dataset.material === material) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Resetear página al cambiar filtro
  paginaActual = 1;  
  
  // Re-renderizar con la categoría actual
  renderProductos(categoriaActual);
}

    // Inicializar lightbox
function inicializarLightbox() {
  const overlay = document.getElementById('lightboxOverlay');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxLoading = document.getElementById('lightboxLoading');
  const closeBtn = document.getElementById('lightboxClose');
  const prevBtn = document.getElementById('lightboxPrev');
  const nextBtn = document.getElementById('lightboxNext');
  
  // Cerrar lightbox
  function cerrarLightbox() {
    overlay.classList.remove('active');
    document.body.style.overflow = ''; // Restaurar scroll
  }
  
  // Abrir lightbox con imagen específica
  function abrirLightbox(imagenSrc, producto) {
    // Mostrar overlay
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Bloquear scroll
    
    // Mostrar loading
    lightboxLoading.style.display = 'block';
    lightboxImage.style.opacity = '0';
    
    // Cargar imagen
    lightboxImage.src = imagenSrc;
    lightboxImage.alt = producto.nombre;
    
    lightboxImage.onload = () => {
      lightboxLoading.style.display = 'none';
      lightboxImage.style.opacity = '1';
    };
    
    lightboxImage.onerror = () => {
      lightboxLoading.innerHTML = '<i class="fas fa-image"></i><span> Imagen no disponible</span>';
      lightboxImage.style.display = 'none';
    };
    
    // Actualizar información
    document.getElementById('lightboxCodigo').textContent = producto.codigo || producto.id;
    document.getElementById('lightboxNombre').textContent = producto.nombre;
    document.getElementById('lightboxPrecio').textContent = `$${producto.precio.toLocaleString()}`;
  }
  
  // Event listeners
  closeBtn.addEventListener('click', cerrarLightbox);
  
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      cerrarLightbox();
    }
  });
  
  // Cerrar con tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) {
      cerrarLightbox();
    }
  });
  
  // Navegación con teclas
  document.addEventListener('keydown', (e) => {
    if (!overlay.classList.contains('active')) return;
    
    if (e.key === 'ArrowLeft') {
      navegarLightbox(-1);
    } else if (e.key === 'ArrowRight') {
      navegarLightbox(1);
    }
  });
  
  // Retornar funciones para uso externo
  return {
    abrir: abrirLightbox,
    cerrar: cerrarLightbox,
    actualizarGaleria: (imagenes, indexInicial) => {
      imagenesGaleria = imagenes;
      imagenActualIndex = indexInicial;
      
      // Mostrar/ocultar botones de navegación
      if (imagenes.length > 1) {
        prevBtn.style.display = 'flex';
        nextBtn.style.display = 'flex';
      } else {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
      }
    }
  };
}

// Función de navegación
function navegarLightbox(direccion) {
  if (imagenesGaleria.length === 0) return;
  
  imagenActualIndex = (imagenActualIndex + direccion + imagenesGaleria.length) % imagenesGaleria.length;
  const item = imagenesGaleria[imagenActualIndex];
  
  abrirLightbox(item.imagen, item.producto);
}

// Variable global para el lightbox
let lightboxAPI;

// 4. MODIFICAR LA FUNCIÓN cambiarCategoria (agregar esta línea)
    function cambiarCategoria(cat) {
      categoriaActual = cat;
      
      // Si hay búsqueda activa, mantenerla al cambiar categoría
      if (busquedaActiva) {
        buscarPorCodigo(busquedaActiva);
      } else {
        renderProductos(cat);
      }
      
      tabs.forEach(tab => {
        if (tab.dataset.cat === cat) {
          tab.classList.add('active');
        } else {
          tab.classList.remove('active');
        }
      });
    }

    // Estado: carrito = { id: { id, nombre, codigo, precio, cantidad, icono } }
    let carrito = {};

    // Referencias DOM
    const productosContainer = document.getElementById('productosContainer');
    const listaCarrito = document.getElementById('lista-carrito');
    const totalSpan = document.getElementById('total-carrito');
    const emptyMsg = document.getElementById('empty-cart-placeholder');
    const tabs = document.querySelectorAll('.tab-btn');
    const whatsappBtn = document.getElementById('whatsapp-btn');

    // Categoria activa
    let categoriaActual = 'anillos';

    // ---------- FUNCIONES DE RENDERIZADO ----------
       function renderProductos(categoria) {
      // Si hay búsqueda activa, no aplicar filtros normales
      if (busquedaActiva) {
        buscarPorCodigo(busquedaActiva);
        return;
      }
      
      const productos = productosData[categoria] || [];
      
      // Aplicar filtros combinados
      let productosFiltrados = productos;
      
      // Filtro por material
      if (materialSeleccionado !== 'todos') {
        productosFiltrados = productosFiltrados.filter(prod => prod.material === materialSeleccionado);
      }
      
      // Filtro por sexo
      if (sexoSeleccionado !== 'todos') {
        productosFiltrados = productosFiltrados.filter(prod => prod.sexo === sexoSeleccionado);
      }
      
      // Guardar globalmente para paginación
      productosFiltradosGlobal = productosFiltrados;
      
      // Resetear a página 1
      paginaActual = 1;
      
      // Renderizar con paginación
      renderizarProductosPaginados();
    }    

    // Función mejorada para generar HTML de imagen
    function generarImagenHTML(producto) {
      const iconoClass = producto.icono || 'fa-gem';
      const nombreProducto = producto.nombre || 'Producto';
      
      // Si no hay imagen definida, mostrar placeholder
      if (!producto.imagen) {
        return `
          <div class="img-placeholder">
            <i class="fas ${iconoClass}"></i>
            <span>${nombreProducto.substring(0, 20)}</span>
          </div>
          <div class="no-image-badge">Sin imagen</div>
        `;
      }
      
      // Si hay imagen, crear estructura completa con fallbacks
      return `
        <!-- Placeholder inicial -->
        <div class="img-placeholder">
          <i class="fas ${iconoClass}"></i>
          <span>Cargando...</span>
        </div>
        
        <!-- Imagen real -->
        <img 
          src="${producto.imagen}" 
          alt="${nombreProducto}"
          loading="lazy"
          decoding="async"
          onload="this.classList.add('loaded'); this.parentElement.classList.remove('loading');
          const placeholder = this.parentElement.querySelector('.img-placeholder');
          if(placeholder) placeholder.style.display = 'none';"
          onerror="this.style.display='none'; 
                   this.parentElement.querySelector('.img-placeholder').innerHTML = '<i class=\'fas fa-image\'></i><span>Imagen no disponible</span>';
                   this.parentElement.classList.add('error');"
        >
      `;
    }

    // Función principal de búsqueda por código
function buscarPorCodigo(codigoBuscado) {
  if (!codigoBuscado || codigoBuscado.trim() === '') {
    busquedaActiva = '';
    document.getElementById('btnLimpiarBusqueda').classList.add('hidden');
    document.getElementById('busquedaActivaBadge').style.display = 'none';
    
    // Restaurar vista normal
    renderProductos(categoriaActual);
    return;
  }
  
  busquedaActiva = codigoBuscado.trim().toUpperCase();
  
  // Mostrar botón limpiar
  document.getElementById('btnLimpiarBusqueda').classList.remove('hidden');
  
  // Actualizar badge
  document.getElementById('textoBusquedaActiva').textContent = `🔍 Buscando: ${busquedaActiva}`;
  document.getElementById('busquedaActivaBadge').style.display = 'inline-flex';
  
  // Filtrar productos en categoría actual
  const productos = productosData[categoriaActual] || [];
  
  const productosEncontrados = productos.filter(prod => {
    const codigo = (prod.codigo || prod.id || '').toUpperCase();
    return codigo.includes(busquedaActiva);
  });
  
  // Actualizar vista
  productosFiltradosGlobal = productosEncontrados;
  paginaActual = 1;
  
  if (productosEncontrados.length > 0) {
    renderizarProductosPaginados();
    actualizarInfoResultados(productosEncontrados.length, categoriaActual);
  } else {
    // Mostrar mensaje de no encontrado
    productosContainer.innerHTML = `
      <div class="empty-cart-msg" style="grid-column:1/-1; padding:40px; text-align:center;">
        <i class="fas fa-search" style="font-size:2.5rem; opacity:0.5; margin-bottom:16px;"></i>
        <h3 style="margin-bottom:8px; color:#4f3f38;">No se encontraron productos</h3>
        <p style="color:#9b8a7c;">No hay productos con el código "${busquedaActiva}" en esta categoría.</p>
        <button onclick="limpiarBusqueda()" style="margin-top:16px; background:#2c2b2a; color:white; border:none; padding:10px 20px; border-radius:40px; cursor:pointer;">
          <i class="fas fa-arrow-left"></i> Volver al catálogo
        </button>
      </div>
    `;
    
    // Ocultar paginación
    document.getElementById('paginacionContainer').style.display = 'none';
  }
}

// Función para limpiar búsqueda
function limpiarBusqueda() {
  busquedaActiva = '';
  document.getElementById('buscadorCodigo').value = '';
  document.getElementById('btnLimpiarBusqueda').classList.add('hidden');
  document.getElementById('busquedaActivaBadge').style.display = 'none';
  document.getElementById('sugerenciasContainer').classList.remove('show');
  
  // Restaurar vista normal
  renderProductos(categoriaActual);
}

// Función de sugerencias mientras escribe
function mostrarSugerencias(valor) {
  const sugerenciasContainer = document.getElementById('sugerenciasContainer');
  
  if (!valor || valor.trim().length < 2) {
    sugerenciasContainer.classList.remove('show');
    return;
  }
  
  const busqueda = valor.trim().toUpperCase();
  const productos = productosData[categoriaActual] || [];
  
  const sugerencias = productos
    .filter(prod => {
      const codigo = (prod.codigo || prod.id || '').toUpperCase();
      return codigo.includes(busqueda);
    })
    .slice(0, 8); // Máximo 8 sugerencias
  
  if (sugerencias.length === 0) {
    sugerenciasContainer.classList.remove('show');
    return;
  }
  
  // Renderizar sugerencias
  let html = '';
  sugerencias.forEach(prod => {
    const codigo = prod.codigo || prod.id;
    html += `
      <div class="sugerencia-item" data-codigo="${codigo}">
        <span class="sugerencia-codigo">${codigo}</span>
        <span class="sugerencia-nombre">${prod.nombre}</span>
        <span class="sugerencia-categoria">${categoriaActual}</span>
      </div>
    `;
  });
  
  sugerenciasContainer.innerHTML = html;
  sugerenciasContainer.classList.add('show');
  
  // Agregar event listeners a las sugerencias
  document.querySelectorAll('.sugerencia-item').forEach(item => {
    item.addEventListener('click', () => {
      const codigo = item.dataset.codigo;
      document.getElementById('buscadorCodigo').value = codigo;
      sugerenciasContainer.classList.remove('show');
      buscarPorCodigo(codigo);
    });
  });
}

// Función de búsqueda global (todas las categorías)
function buscarGlobalmente(codigoBuscado) {
  if (!codigoBuscado || codigoBuscado.trim() === '') return;
  
  const busqueda = codigoBuscado.trim().toUpperCase();
  
  // Buscar en todas las categorías
  const resultados = [];
  Object.keys(productosData).forEach(categoria => {
    productosData[categoria].forEach(prod => {
      const codigo = (prod.codigo || prod.id || '').toUpperCase();
      if (codigo.includes(busqueda)) {
        resultados.push({
          ...prod,
          categoriaEncontrada: categoria
        });
      }
    });
  });
  
  if (resultados.length === 1) {
    // Si hay un solo resultado, ir directamente a él
    const producto = resultados[0];
    categoriaActual = producto.categoriaEncontrada;
    
    // Actualizar tabs
    tabs.forEach(tab => {
      if (tab.dataset.cat === categoriaActual) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
    
    // Buscar en esa categoría
    buscarPorCodigo(busqueda);
  } else if (resultados.length > 1) {
    // Mostrar resultados de múltiples categorías
    mostrarResultadosGlobales(resultados, busqueda);
  } else {
    alert(`No se encontraron productos con el código "${busqueda}"`);
  }
}

// Mostrar resultados de búsqueda global
function mostrarResultadosGlobales(resultados, busqueda) {
  let html = `
    <div class="empty-cart-msg" style="grid-column:1/-1; padding:20px;">
      <i class="fas fa-search" style="font-size:2rem; opacity:0.5;"></i>
      <h3>${resultados.length} productos encontrados con "${busqueda}"</h3>
      <p style="margin-bottom:20px;">Selecciona una categoría para ver los productos:</p>
      <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
  `;
  
  // Agrupar por categoría
  const porCategoria = {};
  resultados.forEach(prod => {
    if (!porCategoria[prod.categoriaEncontrada]) {
      porCategoria[prod.categoriaEncontrada] = [];
    }
    porCategoria[prod.categoriaEncontrada].push(prod);
  });
  
  Object.keys(porCategoria).forEach(cat => {
    const catNombre = {
      'anillos': 'Anillos',
      'collares': 'Collares',
      'pulseras': 'Pulseras',
      'aretes': 'Aretes'
    }[cat] || cat;
    
    html += `
      <button onclick="irACategoriaYBuscar('${cat}', '${busqueda}')" 
              style="background:white; border:2px solid #e1d5cc; padding:12px 20px; border-radius:40px; cursor:pointer;">
        <i class="fas fa-folder"></i> ${catNombre} (${porCategoria[cat].length})
      </button>
    `;
  });
  
  html += `</div></div>`;
  
  productosContainer.innerHTML = html;
  document.getElementById('paginacionContainer').style.display = 'none';
}

// Función auxiliar para ir a categoría y buscar
function irACategoriaYBuscar(categoria, busqueda) {
  categoriaActual = categoria;
  
  // Actualizar tabs
  tabs.forEach(tab => {
    if (tab.dataset.cat === categoria) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
  
  document.getElementById('buscadorCodigo').value = busqueda;
  buscarPorCodigo(busqueda);
}

// Hacer funciones globales para eventos inline
window.limpiarBusqueda = limpiarBusqueda;
window.irACategoriaYBuscar = irACategoriaYBuscar;

// Nueva función para solo renderizar DOM (separada de la lógica de filtro)
        function renderizarProductosEnDOM(productos) {
          let html = '';
          
          if (productos.length === 0) {
            html = `<div class="empty-cart-msg" style="grid-column:1/-1; padding:40px; text-align:center;">
              <i class="fas fa-search" style="font-size:2rem; opacity:0.5;"></i>
              <p>No hay productos con los filtros seleccionados</p>
            </div>`;
          } else {
            productos.forEach((prod,index) => {
                             
              const productoJSON = JSON.stringify(prod).replace(/"/g, '&quot;');
              const sexoTexto = {
                'F': 'Femenino',
                'M': 'Masculino',
                'A': 'Niña',
                'O': 'Niño'
              }[prod.sexo] || '';
              
              // Icono según sexo
              const sexoIcono = {
                'F': 'fa-venus',
                'M': 'fa-mars',
                'A': 'fa-child',
                'O': 'fa-child'
              }[prod.sexo] || 'fa-user';
              
              // Generar HTML de imagen
              const imagenHTML = generarImagenHTML(prod);
              
              html += `
                <div class="producto-card" data-id="${prod.id}">
                  <div class="producto-img loading" data-imagen="${prod.imagen || ''}" data-producto='${productoJSON}'>
                    ${imagenHTML}
                  </div>
                  <div class="producto-info">
                    <div style="display:flex; justify-content:space-between; align-items:start;">
                      <h3>${prod.nombre}</h3>                      
                    </div>                    
                    <div class="producto-desc">${prod.desc}</div>
                    <div><span style="font-size:0.65rem; color:#9b8a7c; background:#f5ede7; padding:2px 6px; border-radius:12px;">${prod.codigo || prod.id}</span></div>
                    <div style="display:flex; gap:4px; margin:4px 0; flex-wrap:wrap;">
                      <span style="font-size:0.7rem; background:#f0e9e3; padding:2px 8px; border-radius:12px;">${prod.material}</span>
                      <span class="sexo-badge ${prod.sexo}" style="font-size:0.7rem; padding:2px 8px; border-radius:12px;">
                        <i class="fas ${sexoIcono}"></i> ${sexoTexto}
                      </span>
                    </div>
                    <div class="precio">$${prod.precio.toLocaleString()}</div>
                  </div>
                  <div class="acciones-producto">
                    <div class="cantidad-control" data-id="${prod.id}">
                      <button class="btn-restar" data-id="${prod.id}">−</button>
                      <span id="cant-${prod.id}">1</span>
                      <button class="btn-sumar" data-id="${prod.id}">+</button>
                    </div>
                    <button class="btn-agregar" data-id="${prod.id}" data-nombre="${prod.nombre}" data-precio="${prod.precio}" data-codigo ="${prod.codigo}" data-imagen="${prod.imagen || ''}">
                      <i class="fas fa-cart-plus"></i> Agregar
                    </button>
                  </div>
                </div>
              `;
            });
          }
          
          productosContainer.innerHTML = html;

          // ⭐ AGREGAR EVENTOS DE CLIC A LAS IMÁGENES
          document.querySelectorAll('.producto-img').forEach(imgContainer => {
            imgContainer.addEventListener('click', (e) => {
              // Evitar que se active si se hizo clic en un botón dentro de la imagen
              if (e.target.closest('button')) return;
              
              const productoData = JSON.parse(imgContainer.dataset.producto);
              const imagenSrc = productoData.imagen;
              
              if (imagenSrc) {
                // Crear galería con las imágenes de la categoría actual
                const imagenesCategoria = Array.from(document.querySelectorAll('.producto-img'))
                  .map(el => ({
                    imagen: el.dataset.imagen,
                    producto: JSON.parse(el.dataset.producto)
                  }))
                  .filter(item => item.imagen);
                
                const indexActual = imagenesCategoria.findIndex(
                  item => item.producto.id === productoData.id
                );
                
                lightboxAPI.actualizarGaleria(imagenesCategoria, indexActual);
                lightboxAPI.abrir(imagenSrc, productoData);
              } else {
                // Si no hay imagen, mostrar mensaje
                alert('Este producto no tiene imagen disponible');
              }
            });
          });  
          
          // Re-asignar eventos
          document.querySelectorAll('.btn-sumar').forEach(btn => {
            btn.addEventListener('click', (e) => {
              e.stopPropagation();
              const id = btn.dataset.id;
              const span = document.getElementById(`cant-${id}`);
              let val = parseInt(span.textContent) || 1;
              span.textContent = val + 1;
            });
          });
          
          document.querySelectorAll('.btn-restar').forEach(btn => {
            btn.addEventListener('click', (e) => {
              e.stopPropagation();
              const id = btn.dataset.id;
              const span = document.getElementById(`cant-${id}`);
              let val = parseInt(span.textContent) || 1;
              if (val > 1) span.textContent = val - 1;
            });
          });
        
          document.querySelectorAll('.btn-agregar').forEach(btn => {
            btn.addEventListener('click', (e) => {
              const id = btn.dataset.id;
              const nombre = btn.dataset.nombre;
              const precio = parseFloat(btn.dataset.precio);
              const codigo = btn.dataset.codigo;
              const imagen = btn.dataset.imagen;
              const cantidadSpan = document.getElementById(`cant-${id}`);
              let cantidad = parseInt(cantidadSpan.textContent) || 1;
        
              agregarAlCarrito(id, nombre, precio, codigo, cantidad, imagen);
              cantidadSpan.textContent = '1';
            });
          });
        }

    // Agregar/actualizar carrito
    function agregarAlCarrito(id, nombre, precio, codigo, cantidad, imagen) {
      if (carrito[id]) {
        carrito[id].cantidad += cantidad;
      } else {
        carrito[id] = { 
          id, 
          nombre, 
          precio,
          codigo, 
          cantidad, 
          imagen: imagen || null 
        };
      }
      actualizarCarritoUI();
      guardarCarritoEnStorage();
    }

    function eliminarDelCarrito(id) {
      if (carrito[id]) {
        delete carrito[id];
      }
      actualizarCarritoUI();
      guardarCarritoEnStorage();
    }

    function actualizarCarritoUI() {
  const ids = Object.keys(carrito);
  if (ids.length === 0) {
    listaCarrito.innerHTML = '';
    emptyMsg.style.display = 'block';
    totalSpan.textContent = '$0';
    return;
  }
  emptyMsg.style.display = 'none';
  
  let html = '';
  let total = 0;
  ids.forEach(id => {
    const item = carrito[id];
    const subtotal = item.precio * item.cantidad;
    total += subtotal;
    
    // Miniatura en carrito (opcional)
    const miniaturaHTML = item.imagen 
      ? `<img src="${item.imagen}" style="width:30px; height:30px; border-radius:8px; object-fit:cover; margin-right:8px;">` 
      : `<i class="fas fa-gem" style="margin-right:8px; color:#b9a394;"></i>`;
    
    html += `
      <li class="item-carrito">
        <div style="display:flex; align-items:center;">
          ${miniaturaHTML}
          <div class="item-info">
            <span class="item-nombre">${item.nombre}</span>
            <span class="item-cantidad-precio">${item.codigo}</span>
            <span class="item-cantidad-precio">${item.cantidad} x $${item.precio.toLocaleString()}</span>
          </div>
        </div>
        <div style="display:flex; align-items:center;">
          <span style="font-weight:600; margin-right:8px;">$${subtotal.toLocaleString()}</span>
          <button class="item-eliminar" data-id="${id}" title="Eliminar"><i class="fas fa-trash-alt"></i></button>
        </div>
      </li>
    `;
  });
  listaCarrito.innerHTML = html;
  totalSpan.textContent = `$${total.toLocaleString()}`;

  document.querySelectorAll('.item-eliminar').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = btn.dataset.id;
      eliminarDelCarrito(id);
    });
  });
}

    // Generar texto para WhatsApp (producto, cantidad, precio unitario)
    function generarTextoPedido() {
      const ids = Object.keys(carrito);
      if (ids.length === 0) return '';
    
      let mensaje = '🛍️ *PEDIDO AUREA* 🛍️\n\n';
      let total = 0;
      
      ids.forEach(id => {
        const p = carrito[id];
        const subtotal = p.precio * p.cantidad;
        total += subtotal;
        
        // ✅ Una sola línea por producto
        mensaje += `• ${p.cantidad}x ${p.nombre} (${id}) - $${subtotal.toLocaleString()}\n`;
      });
      
      mensaje += `\n💰 *TOTAL: $${total.toLocaleString()}*`;
      
      return mensaje;
    }

    // Función para cambiar filtro de sexo
    function cambiarFiltroSexo(sexo) {
      sexoSeleccionado = sexo;
      
      // Actualizar botones activos
      document.querySelectorAll('.sexo-btn').forEach(btn => {
        if (btn.dataset.sexo === sexo) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
      
      // Resetear página al cambiar filtro
      paginaActual = 1;
      
      // Re-renderizar con la categoría actual
      renderProductos(categoriaActual);
    }

    // Enviar por WhatsApp
    function enviarWhatsApp() {
      const ids = Object.keys(carrito);
      if (ids.length === 0) {
        alert('Agrega al menos un producto al carrito.');
        return;
      }
      const texto = generarTextoPedido();
      // Número de ejemplo (cambiar por el real). Usamos encodeURIComponent
      const numeroWhatsApp = '573011337774'; // reemplazar con el número deseado (sin +, con código país)
      const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(texto)}`;
      window.open(url, '_blank');
    }

    // ---------- PERSISTENCIA EN STORAGE ----------
    function guardarCarritoEnStorage() {
      localStorage.setItem('joyeriaCarrito', JSON.stringify(carrito));
    }

    function cargarCarritoDeStorage() {
      const stored = localStorage.getItem('joyeriaCarrito');
      if (stored) {
        try {
          carrito = JSON.parse(stored) || {};
        } catch(e){ carrito = {}; }
      }
      actualizarCarritoUI();
    }

    // ---------- CAMBIO DE CATEGORÍA (multipágina) ----------
    function cambiarCategoria(cat) {
      categoriaActual = cat;
      renderProductos(cat);
      // actualizar clase activa
      tabs.forEach(tab => {
        if (tab.dataset.cat === cat) {
          tab.classList.add('active');
        } else {
          tab.classList.remove('active');
        }
      });
    }

    // Función para obtener productos de la página actual
    function obtenerProductosPagina(productos) {
      const inicio = (paginaActual - 1) * PRODUCTOS_POR_PAGINA;
      const fin = inicio + PRODUCTOS_POR_PAGINA;
      return productos.slice(inicio, fin);
    }
    
    // Función para renderizar la paginación
    function renderizarPaginacion(totalProductos) {
      totalPaginas = Math.ceil(totalProductos / PRODUCTOS_POR_PAGINA);
      
      if (totalPaginas <= 1) {
        document.getElementById('paginacionContainer').style.display = 'none';
        return;
      }
      
      document.getElementById('paginacionContainer').style.display = 'flex';
      
      // Actualizar info de página
      document.getElementById('paginacionInfo').textContent = 
        `Página ${paginaActual} de ${totalPaginas}`;
      
      // Actualizar estado de botones de navegación
      document.getElementById('btnPrimeraPagina').disabled = paginaActual === 1;
      document.getElementById('btnAnterior').disabled = paginaActual === 1;
      document.getElementById('btnSiguiente').disabled = paginaActual === totalPaginas;
      document.getElementById('btnUltimaPagina').disabled = paginaActual === totalPaginas;
      
      // Renderizar botones numéricos
      renderizarBotonesNumericos();
    }
    
    // Función para renderizar botones numéricos de páginas
    function renderizarBotonesNumericos() {
      const contenedor = document.getElementById('botonesPaginas');
      contenedor.innerHTML = '';
      
      // Determinar qué páginas mostrar (máximo 5 botones)
      let inicio = Math.max(1, paginaActual - 2);
      let fin = Math.min(totalPaginas, paginaActual + 2);
      
      // Ajustar para mostrar siempre 5 botones si es posible
      if (fin - inicio < 4) {
        if (inicio === 1) {
          fin = Math.min(5, totalPaginas);
        } else if (fin === totalPaginas) {
          inicio = Math.max(1, totalPaginas - 4);
        }
      }
      
      // Agregar puntos suspensivos al inicio si es necesario
      if (inicio > 1) {
        const btnPrimero = crearBotonPagina(1);
        contenedor.appendChild(btnPrimero);
        
        if (inicio > 2) {
          const puntos = document.createElement('span');
          puntos.textContent = '...';
          puntos.style.padding = '0 4px';
          puntos.style.color = '#9b8a7c';
          contenedor.appendChild(puntos);
        }
      }
      
      // Botones de páginas
      for (let i = inicio; i <= fin; i++) {
        const btn = crearBotonPagina(i);
        contenedor.appendChild(btn);
      }
      
      // Agregar puntos suspensivos al final si es necesario
      if (fin < totalPaginas) {
        if (fin < totalPaginas - 1) {
          const puntos = document.createElement('span');
          puntos.textContent = '...';
          puntos.style.padding = '0 4px';
          puntos.style.color = '#9b8a7c';
          contenedor.appendChild(puntos);
        }
        
        const btnUltimo = crearBotonPagina(totalPaginas);
        contenedor.appendChild(btnUltimo);
      }
    }
    
    // Función auxiliar para crear botón de página
    function crearBotonPagina(numero) {
      const btn = document.createElement('button');
      btn.className = 'paginacion-btn';
      if (numero === paginaActual) {
        btn.classList.add('active');
      }
      btn.textContent = numero;
      btn.addEventListener('click', () => cambiarPagina(numero));
      return btn;
    }
    
    // Función para cambiar de página
    function cambiarPagina(nuevaPagina) {
      if (nuevaPagina < 1 || nuevaPagina > totalPaginas) return;
      
      paginaActual = nuevaPagina;
      renderizarProductosPaginados();
      
      // Scroll suave al inicio de los productos
      document.querySelector('.catalogo-section').scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
    
    // Función principal para renderizar con paginación
    function renderizarProductosPaginados() {
      const productosPagina = obtenerProductosPagina(productosFiltradosGlobal);
      renderizarProductosEnDOM(productosPagina);
      renderizarPaginacion(productosFiltradosGlobal.length);
      actualizarInfoResultados(productosFiltradosGlobal.length, categoriaActual);
    }

    // ---------- INICIALIZACIÓN ----------
        function init() {
      cargarCarritoDeStorage();
      inicializarTodosLosProductos();      
      renderProductos(categoriaActual);


      // ✅ BUSCADOR
      const buscadorInput = document.getElementById('buscadorCodigo');
      const btnBuscar = document.getElementById('btnBuscar');
      const btnLimpiarBusqueda = document.getElementById('btnLimpiarBusqueda');
      const btnLimpiarBusquedaBadge = document.getElementById('btnLimpiarBusquedaBadge');

            
      // Buscar al hacer clic
      btnBuscar.addEventListener('click', () => {
        const valor = buscadorInput.value;
        if (valor.trim()) {
          buscarGlobalmente(valor);
        }
        document.getElementById('sugerenciasContainer').classList.remove('show');
      });

       // ⭐ Inicializar lightbox
      lightboxAPI = inicializarLightbox();     
      
      // Buscar al presionar Enter
      buscadorInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const valor = buscadorInput.value;
          if (valor.trim()) {
            buscarGlobalmente(valor);
          }
          document.getElementById('sugerenciasContainer').classList.remove('show');
        }
      });
      
      // Sugerencias mientras escribe
      buscadorInput.addEventListener('input', (e) => {
        mostrarSugerencias(e.target.value);
        
        // Mostrar/ocultar botón limpiar
        if (e.target.value) {
          btnLimpiarBusqueda.classList.remove('hidden');
        } else {
          btnLimpiarBusqueda.classList.add('hidden');
        }
      });
      
      // Limpiar búsqueda
      btnLimpiarBusqueda.addEventListener('click', limpiarBusqueda);
      btnLimpiarBusquedaBadge.addEventListener('click', limpiarBusqueda);
      
      // Cerrar sugerencias al hacer clic fuera
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.buscador-wrapper')) {
          document.getElementById('sugerenciasContainer').classList.remove('show');
        }
      });      
      // Eventos de tabs (ya existen)
      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          const cat = tab.dataset.cat;
          categoriaActual = cat;
          cambiarCategoria(cat);
        });
      });
    
      // Eventos de filtros de material
      document.querySelectorAll('.material-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const material = btn.dataset.material;
          cambiarFiltroMaterial(material);
        });
      });
      
      // ✅ NUEVO: Eventos de filtros de sexo
      document.querySelectorAll('.sexo-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const sexo = btn.dataset.sexo;
          cambiarFiltroSexo(sexo);
        });
      });
      
      // Botón limpiar filtros (actualizado para limpiar ambos)
      const btnLimpiar = document.getElementById('limpiarFiltros');
      if (btnLimpiar) {
        btnLimpiar.addEventListener('click', () => {
          cambiarFiltroMaterial('todos');
          cambiarFiltroSexo('todos');
        });

          
      }
    
      // Eventos de paginación
      document.getElementById('btnPrimeraPagina').addEventListener('click', () => cambiarPagina(1));
      document.getElementById('btnAnterior').addEventListener('click', () => cambiarPagina(paginaActual - 1));
      document.getElementById('btnSiguiente').addEventListener('click', () => cambiarPagina(paginaActual + 1));
      document.getElementById('btnUltimaPagina').addEventListener('click', () => cambiarPagina(totalPaginas));
    
      whatsappBtn.addEventListener('click', enviarWhatsApp);
    }

    init();
  })();
