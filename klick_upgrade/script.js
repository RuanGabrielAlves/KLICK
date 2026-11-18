const imagePool = [
  'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=900&q=85'
];

const apps = [
  {id:1,name:'FocusTime',cat:'Produtividade',icon:'✓',color:'#e9ddff',rating:4.8,downloads:1250,price:0,desc:'Organize seu tempo, crie metas e mantenha o foco em suas tarefas.',screens:['Foco','Metas','Relatórios']},
  {id:2,name:'PlantCare',cat:'Estilo de vida',icon:'🌿',color:'#dff5d2',rating:4.9,downloads:1200,price:12.90,desc:'Cuide das suas plantas com lembretes, identificação e acompanhamento.',screens:['Identifique','Lembretes','Crescimento']},
  {id:3,name:'StudyHub',cat:'Educação',icon:'📚',color:'#ddd9ff',rating:4.7,downloads:750,price:0,desc:'Um espaço completo para estudar, organizar matérias e acompanhar seu progresso.',screens:['Matérias','Tarefas','Progresso']},
  {id:4,name:'FitHome',cat:'Saúde e fitness',icon:'⌁',color:'#d7f3df',rating:4.6,downloads:640,price:9.90,desc:'Treinos simples para fazer em casa e acompanhar seus objetivos.',screens:['Treinos','Agenda','Evolução']},
  {id:5,name:'MoneyOK',cat:'Finanças',icon:'$',color:'#e1e6ff',rating:4.7,downloads:1100,price:5.90,desc:'Controle seus gastos, organize seu orçamento e acompanhe suas finanças.',screens:['Resumo','Gastos','Gráficos']},
  {id:6,name:'Notes+',cat:'Produtividade',icon:'N',color:'#ffe8cc',rating:4.5,downloads:890,price:3.90,desc:'Notas rápidas, listas e organização para o seu dia.',screens:['Notas','Listas','Pastas']},
  {id:7,name:'PhotoLab',cat:'Fotografia',icon:'◉',color:'#ffd9e9',rating:4.6,downloads:980,price:7.90,desc:'Edite suas fotos com filtros, ajustes e ferramentas criativas.',screens:['Editor','Filtros','Ajustes']},
  {id:8,name:'GameBox',cat:'Jogos',icon:'🎮',color:'#ffe0e0',rating:4.4,downloads:2100,price:0,desc:'Uma coleção de jogos rápidos para se divertir.',screens:['Arcade','Desafios','Ranking']}
];

const categories = [
  ['Produtividade','✓'],['Educação','▤'],['Estilo de vida','🌿'],['Saúde e fitness','⌁'],
  ['Finanças','$'],['Fotografia','◉'],['Entretenimento','♪'],['Utilitários','▦'],
  ['Jogos','🎮'],['Personalização','✦']
];

// Distribui imagens de forma diferente a cada carregamento.
apps.forEach((app, index) => {
  const offset = Math.floor(Math.random() * imagePool.length);
  app.image = imagePool[(index + offset) % imagePool.length];
});

let currentPage = 'home';
let priceFilter = 'all';
let activeCategory = null;
let cart = readStorage('klickCart', []);
let library = readStorage('klickLibrary', []);
let user = readStorage('klickUser', null);

function readStorage(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function money(value) {
  return value === 0 ? 'Grátis' : 'R$ ' + Number(value).toFixed(2).replace('.', ',');
}

function save() {
  localStorage.setItem('klickCart', JSON.stringify(cart));
  localStorage.setItem('klickLibrary', JSON.stringify(library));
  updateHeader();
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

function updateHeader() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  document.getElementById('cartCount').textContent = count;
  document.getElementById('accountBtn').textContent = user ? user.name.split(' ')[0] : 'Entrar';
}

function setActiveNav(page) {
  document.querySelectorAll('.bottom-nav button').forEach(button => {
    button.classList.toggle('active', button.dataset.page === page);
  });
}

function navigate(page) {
  currentPage = page;
  activeCategory = null;
  document.getElementById('searchInput').value = '';
  document.getElementById('filterBar').classList.add('hidden');
  render();
  setActiveNav(page);
  window.scrollTo({top:0, behavior:'smooth'});
}

function render() {
  const app = document.getElementById('app');
  if (currentPage === 'home') app.innerHTML = homePage();
  else if (currentPage === 'categories') app.innerHTML = categoriesPage();
  else if (currentPage === 'library') app.innerHTML = libraryPage();
  else if (currentPage === 'profile') app.innerHTML = profilePage();
  else if (currentPage === 'publish') app.innerHTML = publishPage();
  else renderApps();
  updateHeader();
}

function appCard(app) {
  const owned = library.includes(app.id);
  const inCart = cart.find(item => item.id === app.id);
  return `<article class="app-card">
    <button class="app-image-button" onclick="openDetails(${app.id})" aria-label="Ver ${escapeHtml(app.name)}">
      <img class="app-image" src="${app.image}" alt="Imagem de ${escapeHtml(app.name)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'">
      <span class="image-fallback" style="background:${app.color}">${app.icon}</span>
    </button>
    <div class="app-card-content">
      <div class="app-title-row"><h3 title="${escapeHtml(app.name)}">${escapeHtml(app.name)}</h3>${owned ? '<span class="owned-badge">✓</span>' : ''}</div>
      <p>${escapeHtml(app.cat)}</p>
      <div class="rating">★ ${app.rating.toFixed(1)} · ${formatDownloads(app.downloads)} downloads</div>
      <div class="card-bottom"><span class="price">${money(app.price)}</span><button class="small-btn ${inCart ? 'added' : ''}" onclick="quickAdd(${app.id})">${owned ? 'Abrir' : inCart ? 'No carrinho' : app.price === 0 ? 'Obter' : 'Comprar'}</button></div>
    </div>
  </article>`;
}

function formatDownloads(number) {
  return number >= 1000 ? (number / 1000).toFixed(number % 1000 ? 1 : 0) + ' mil' : String(number);
}

function heroImage() {
  return imagePool[Math.floor(Math.random() * imagePool.length)];
}

function homePage() {
  const shuffled = [...apps].sort(() => Math.random() - 0.5);
  const featured = shuffled.slice(0, 5);
  const fresh = shuffled.slice(3, 8);
  const hero = heroImage();
  return `<section class="hero">
    <div class="hero-copy">
      <span class="eyebrow">✦ KLICK STORE</span>
      <h1>Descubra seu próximo aplicativo favorito.</h1>
      <p>Uma vitrine moderna para encontrar apps, jogos e ferramentas criados por desenvolvedores.</p>
      <div class="hero-actions"><button class="primary" onclick="showAll()">Explorar aplicativos</button><button class="hero-secondary" onclick="navigate('categories')">Ver categorias</button></div>
    </div>
    <div class="hero-visual"><img src="${hero}" alt="Destaque da Klick" onerror="this.style.display='none'" /><div class="hero-floating">📱<span>Novidades</span></div></div>
  </section>
  <div class="quick-cats">${categories.slice(0,5).map(c => `<button onclick="categoryApps('${escapeAttr(c[0])}')"><span>${c[1]}</span>${escapeHtml(c[0])}</button>`).join('')}</div>
  <div class="section-head"><div><h2>Destaques</h2><p>Aplicativos escolhidos para você</p></div><button onclick="showAll()">Ver todos →</button></div>
  <div class="app-grid">${featured.map(appCard).join('')}</div>
  <div class="section-head"><div><h2>Novos aplicativos</h2><p>Confira as novidades da loja</p></div><button onclick="showAll()">Ver todos →</button></div>
  <div class="app-grid">${fresh.map(appCard).join('')}</div>`;
}

function showAll() {
  currentPage = 'all';
  activeCategory = null;
  document.getElementById('filterBar').classList.remove('hidden');
  renderApps();
  setActiveNav('');
}

function renderApps() {
  currentPage = 'all';
  const query = document.getElementById('searchInput').value.trim().toLowerCase();
  let list = apps.filter(app => {
    const priceOk = priceFilter === 'all' || (priceFilter === 'free' && app.price === 0) || (priceFilter === 'paid' && app.price > 0);
    const queryOk = !query || `${app.name} ${app.cat} ${app.desc}`.toLowerCase().includes(query);
    const categoryOk = !activeCategory || app.cat === activeCategory;
    return priceOk && queryOk && categoryOk;
  });

  const sort = document.getElementById('sortSelect')?.value || 'popular';
  list.sort((a,b) => sort === 'rating' ? b.rating-a.rating : sort === 'priceAsc' ? a.price-b.price : sort === 'priceDesc' ? b.price-a.price : b.downloads-a.downloads);
  const title = activeCategory || (query ? `Resultados para “${escapeHtml(query)}”` : 'Aplicativos');
  document.getElementById('app').innerHTML = `<h1 class="page-title">${title}</h1><p class="muted">${activeCategory ? 'Aplicativos desta categoria.' : 'Encontre seu próximo aplicativo favorito.'}</p><div class="app-grid">${list.length ? list.map(appCard).join('') : `<div class="empty full-width"><strong>Nenhum aplicativo encontrado.</strong><br><span>Tente outra busca ou remova alguns filtros.</span><br><button class="primary" style="margin-top:15px" onclick="clearFilters()">Limpar filtros</button></div>`}</div>`;
  updateHeader();
}

function searchApps(value) {
  if (value.trim()) {
    document.getElementById('filterBar').classList.remove('hidden');
    renderApps();
  } else if (currentPage === 'all') renderApps();
}

function toggleFilter() { document.getElementById('filterBar').classList.toggle('hidden'); }

function filterByPrice(type, element) {
  priceFilter = type;
  document.querySelectorAll('.chip').forEach(chip => chip.classList.remove('active'));
  element.classList.add('active');
  renderApps();
}

function clearFilters() {
  priceFilter = 'all';
  activeCategory = null;
  document.getElementById('searchInput').value = '';
  const select = document.getElementById('sortSelect');
  if (select) select.value = 'popular';
  document.querySelectorAll('.chip').forEach((chip, i) => chip.classList.toggle('active', i === 0));
  renderApps();
}

function categoriesPage() {
  return `<h1 class="page-title">Categorias</h1><p class="muted">Explore aplicativos por categoria.</p><div class="categories-grid">${categories.map(category => `<button class="category" onclick="categoryApps('${escapeAttr(category[0])}')"><span class="cat-icon">${category[1]}</span>${escapeHtml(category[0])}<span class="arrow">›</span></button>`).join('')}</div>`;
}

function categoryApps(category) {
  activeCategory = category;
  document.getElementById('filterBar').classList.remove('hidden');
  document.getElementById('searchInput').value = '';
  currentPage = 'all';
  renderApps();
  setActiveNav('');
}

function openDetails(id) {
  const app = apps.find(item => item.id === id);
  if (!app) return;
  const owned = library.includes(id);
  const inCart = cart.some(item => item.id === id);
  const action = owned ? `navigate('library');closeModal()` : `addToCart(${id})`;
  openModal(`<div class="detail">
    <div class="detail-head"><div class="detail-app-image"><img src="${app.image}" alt="${escapeHtml(app.name)}"></div><div><h1>${escapeHtml(app.name)}</h1><p class="muted">${escapeHtml(app.cat)} · Klick Store</p><div class="rating">★ ${app.rating.toFixed(1)} · ${formatDownloads(app.downloads)} downloads</div></div></div>
    <div class="detail-stats"><span>📦 28 MB</span><span>✓ Seguro</span><span>♙ Para todos</span></div>
    <p>${escapeHtml(app.desc)}</p>
    <div class="screens">${app.screens.map((screen,index) => `<div class="screen screen-${index}"><span>📱</span><b>${escapeHtml(screen)}</b><small>Prévia do aplicativo</small></div>`).join('')}</div>
    <h3>Sobre este app</h3><p class="muted">${escapeHtml(app.desc)} Tenha uma experiência simples, rápida e organizada dentro da Klick.</p>
    <div class="detail-actions"><button class="primary" style="flex:1" onclick="${action}">${owned ? 'Ir para biblioteca' : inCart ? 'Adicionar mais uma unidade' : app.price === 0 ? 'Obter gratuitamente' : 'Comprar · ' + money(app.price)}</button></div>
  </div>`);
}

function quickAdd(id) {
  const app = apps.find(item => item.id === id);
  if (!app) return;
  if (library.includes(id)) { navigate('library'); return; }
  addToCart(id, false);
}

function addToCart(id, openAfter = true) {
  const app = apps.find(item => item.id === id);
  if (!app) return;
  if (library.includes(id)) { showToast('Você já possui este aplicativo.'); return; }
  const existing = cart.find(item => item.id === id);
  if (existing) existing.qty += 1;
  else cart.push({id, qty:1});
  save();
  showToast(`${app.name} foi adicionado ao carrinho.`);
  if (openAfter) { closeModal(); openCart(); }
}

function cartTotal() {
  return cart.reduce((total,item) => {
    const app = apps.find(a => a.id === item.id);
    return total + (app ? app.price * item.qty : 0);
  }, 0);
}

function openCart() {
  const total = cartTotal();
  const quantity = cart.reduce((sum,item) => sum + item.qty, 0);
  openModal(`<div class="cart-modal"><div class="cart-heading"><div><h2>Seu carrinho 🛒</h2><p class="muted">${quantity} ${quantity === 1 ? 'item' : 'itens'}</p></div></div>
    ${cart.length ? `<div class="cart-list">${cart.map(item => {
      const app = apps.find(a => a.id === item.id);
      if (!app) return '';
      return `<div class="cart-row"><div class="cart-image"><img src="${app.image}" alt="${escapeHtml(app.name)}"></div><div class="cart-row-info"><b>${escapeHtml(app.name)}</b><span>${money(app.price)} cada</span></div><div class="qty"><button onclick="changeQty(${app.id},-1)" aria-label="Diminuir">−</button><strong>${item.qty}</strong><button onclick="changeQty(${app.id},1)" aria-label="Aumentar">+</button></div></div>`;
    }).join('')}</div><div class="cart-summary"><span>Total</span><strong>${money(total)}</strong></div><div class="cart-actions"><button class="secondary-btn" onclick="clearCart()">Limpar</button><button class="primary" style="flex:1" onclick="checkout()">Finalizar compra</button></div>` : `<div class="empty"><strong>Seu carrinho está vazio.</strong><br><span>Encontre um aplicativo e adicione-o aqui.</span><br><button class="primary" style="margin-top:16px" onclick="closeModal();navigate('home')">Explorar aplicativos</button></div>`}
  </div>`);
}

function changeQty(id, amount) {
  const item = cart.find(entry => entry.id === id);
  if (!item) return;
  item.qty += amount;
  if (item.qty <= 0) cart = cart.filter(entry => entry.id !== id);
  save();
  openCart();
}

function clearCart() {
  cart = [];
  save();
  showToast('Carrinho limpo.');
  openCart();
}

function checkout() {
  if (!cart.length) return;
  if (!user) {
    closeModal();
    openLogin('Para finalizar a compra, entre na sua conta.');
    return;
  }
  const purchased = cart.map(item => item.id);
  purchased.forEach(id => { if (!library.includes(id)) library.push(id); });
  cart = [];
  save();
  closeModal();
  showToast('Compra concluída! Apps adicionados à biblioteca.');
  navigate('library');
}

function libraryPage() {
  return `<h1 class="page-title">Minha biblioteca</h1><p class="muted">Seus aplicativos adquiridos ficam aqui.</p>${library.length ? `<div class="library-list">${library.map(id => {
    const app = apps.find(item => item.id === id);
    if (!app) return '';
    return `<div class="library-item"><div class="library-image"><img src="${app.image}" alt="${escapeHtml(app.name)}"></div><div class="library-info"><h3>${escapeHtml(app.name)}</h3><p>${escapeHtml(app.cat)} · ★ ${app.rating.toFixed(1)}</p></div><button class="small-btn" onclick="openApp(${app.id})">Abrir</button></div>`;
  }).join('')}</div>` : `<div class="empty"><strong>Sua biblioteca ainda está vazia.</strong><br><span>Os aplicativos comprados aparecerão aqui.</span><br><button class="primary" style="margin-top:15px" onclick="navigate('home')">Encontrar aplicativos</button></div>`}`;
}

function openApp(id) {
  const app = apps.find(item => item.id === id);
  if (app) showToast(`Abrindo ${app.name}...`);
}

function profilePage() {
  if (!user) return `<div class="profile-card"><div class="avatar">?</div><h2>Entre no Klick</h2><p>Faça login para acessar sua biblioteca, compras e perfil.</p><button class="primary" style="background:#fff;color:#4c1d95" onclick="openLogin()">Entrar ou criar conta</button></div>`;
  return `<div class="profile-card"><div class="avatar">${escapeHtml(user.name[0].toUpperCase())}</div><h2>${escapeHtml(user.name)}</h2><p>${escapeHtml(user.email)}</p><div class="profile-stats"><div><b>${library.length}</b><span>Aplicativos</span></div><div><b>${library.reduce((sum,id) => sum + (apps.find(a => a.id === id)?.downloads || 0),0).toLocaleString('pt-BR')}</b><span>Downloads</span></div><div><b>4,8</b><span>Avaliação média</span></div></div></div><div class="form-card"><h3>Minha conta</h3><button class="category account-link" onclick="navigate('library')">▣ Minha biblioteca <span class="arrow">›</span></button><button class="category account-link" onclick="navigate('publish')">＋ Publicar aplicativo <span class="arrow">›</span></button><button class="category account-link danger" onclick="logout()">↪ Sair da conta</button></div>`;
}

function publishPage() {
  return `<div class="form-card"><h1 class="page-title">Publicar aplicativo</h1><p class="muted">Coloque seu aplicativo no Klick e alcance novos usuários.</p><div class="stepper"><div class="step active"><b>1</b>Informações</div><div class="step"><b>2</b>Arquivos</div><div class="step"><b>3</b>Conteúdo</div><div class="step"><b>4</b>Preço</div><div class="step"><b>5</b>Revisão</div></div><div class="form-group"><label>Nome do aplicativo *</label><input id="pubName" placeholder="Ex.: FocusTime"></div><div class="form-group"><label>Categoria *</label><select id="pubCat"><option value="">Selecione</option>${categories.map(c => `<option>${escapeHtml(c[0])}</option>`).join('')}</select></div><div class="form-group"><label>Descrição curta *</label><textarea id="pubDesc" maxlength="120" placeholder="Explique rapidamente o que seu app faz."></textarea></div><div class="form-group"><label>Preço</label><select id="pubPrice"><option value="0">Grátis</option><option value="4.90">R$ 4,90</option><option value="9.90">R$ 9,90</option><option value="19.90">R$ 19,90</option></select></div><button class="primary" style="width:100%" onclick="publishApp()">Continuar publicação</button></div>`;
}

function publishApp() {
  if (!user) { openLogin('Entre na sua conta para publicar um aplicativo.'); return; }
  const name = document.getElementById('pubName').value.trim();
  const cat = document.getElementById('pubCat').value;
  const desc = document.getElementById('pubDesc').value.trim();
  const price = Number(document.getElementById('pubPrice').value);
  if (!name || !cat || !desc) { showToast('Preencha os campos obrigatórios.'); return; }
  apps.push({id:Date.now(),name,cat,icon:'✦',color:'#eee5ff',rating:0,downloads:0,price,desc,screens:['Seu app','Recursos','Preview'],image:imagePool[Math.floor(Math.random()*imagePool.length)]});
  showToast('Aplicativo enviado para revisão!');
  navigate('home');
}

function openAccount() { user ? navigate('profile') : openLogin(); }

function openLogin(message='') {
  openModal(`<div class="login-modal"><h2>Entrar no Klick</h2>${message ? `<p class="muted">${escapeHtml(message)}</p>` : ''}<div class="form-group"><label>Nome</label><input id="loginName" placeholder="Seu nome"></div><div class="form-group"><label>E-mail</label><input id="loginEmail" type="email" placeholder="voce@email.com"></div><div class="form-group"><label>Senha</label><input id="loginPass" type="password" placeholder="••••••••"></div><button class="primary" style="width:100%" onclick="login()">Entrar</button><p class="demo-note">Demo: os dados ficam somente neste navegador.</p></div>`);
}

function login() {
  const name = document.getElementById('loginName').value.trim();
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPass').value;
  if (!name || !email.includes('@') || pass.length < 4) { showToast('Informe nome, e-mail válido e senha com pelo menos 4 caracteres.'); return; }
  user = {name,email};
  localStorage.setItem('klickUser', JSON.stringify(user));
  closeModal();
  updateHeader();
  showToast('Login realizado com sucesso!');
  navigate('profile');
}

function logout() {
  user = null;
  localStorage.removeItem('klickUser');
  showToast('Você saiu da conta.');
  navigate('home');
}

function openModal(content) {
  document.getElementById('modalContent').innerHTML = content;
  document.getElementById('modal').classList.remove('hidden');
  document.body.classList.add('modal-open');
}

function closeModal(event) {
  if (!event || event.target === document.getElementById('modal')) {
    document.getElementById('modal').classList.add('hidden');
    document.body.classList.remove('modal-open');
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
}

function escapeAttr(value) { return escapeHtml(value).replace(/`/g, '&#96;'); }

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeModal();
  if (event.key === 'Enter' && document.activeElement === document.getElementById('searchInput')) searchApps(document.getElementById('searchInput').value);
});

render();
setActiveNav('home');
