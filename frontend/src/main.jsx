import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import './functional.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
const starterProducts = [
  { id: 1, name: 'Arc Table Lamp', description: 'Warm ambient lighting with a sculptural silhouette.', current_price: 129, stock_quantity: 18, category: 'Home' },
  { id: 2, name: 'Linen Market Tote', description: 'A durable everyday carry, made from washed linen.', current_price: 42, stock_quantity: 34, category: 'Lifestyle' },
  { id: 3, name: 'Stoneware Set', description: 'Hand-finished ceramics for slow weekend breakfasts.', current_price: 86, stock_quantity: 12, category: 'Kitchen' },
  { id: 4, name: 'Daily Journal', description: 'A considered place for ideas, lists, and sketches.', current_price: 24, stock_quantity: 76, category: 'Stationery' },
  { id: 5, name: 'Oak Catchall', description: 'Solid oak tray for the small things that matter.', current_price: 58, stock_quantity: 9, category: 'Home' },
  { id: 6, name: 'Canvas Weekender', description: 'A soft-structured bag for two-day escapes.', current_price: 118, stock_quantity: 21, category: 'Lifestyle' }
];
const starterOrders = [
  { id: 1048, status: 'successful', total_price: 214, timestamp: '2026-10-28T11:24:00', items: 3 },
  { id: 1047, status: 'pending', total_price: 86, timestamp: '2026-10-25T09:10:00', items: 1 }
];

const api = {
  async request(path, options = {}) {
    let response;
    try {
      response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
      });
    } catch {
      throw new Error('The API server is not running. Start it with .\\start-dev.ps1');
    }
    if (!response.ok) {
      let detail = 'Request failed';
      try { detail = (await response.json()).detail || detail; } catch { /* non-json response */ }
      throw new Error(detail);
    }
    return response.status === 204 ? null : response.json();
  },
  products: () => api.request('/products/'),
  createProduct: (body) => api.request('/products/', { method: 'POST', body: JSON.stringify(body) }),
  deleteProduct: (id) => api.request(`/products/${id}`, { method: 'DELETE' }),
  signup: (body) => api.request('/users/signup', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => api.request('/users/login', { method: 'POST', body: JSON.stringify(body) }),
  profile: (id) => api.request(`/users/${id}`),
  updateProfile: (id, body) => api.request(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  users: () => api.request('/users/'),
  deleteUser: (id) => api.request(`/users/${id}`, { method: 'DELETE' }),
  orders: (id) => api.request(`/orders/user/${id}`),
  allOrders: () => api.request('/orders/all'),
  createOrder: (body) => api.request('/orders/', { method: 'POST', body: JSON.stringify(body) }),
  addItem: (body) => api.request('/orders/items', { method: 'POST', body: JSON.stringify(body) }),
  cancelOrder: (id) => api.request(`/orders/${id}/cancel`, { method: 'POST' }),
  updateOrderStatus: (id, status) => api.request(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
};

const money = (value) => `$${Number(value || 0).toFixed(2)}`;
const date = (value) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
const isStaff = (user) => user.role === 'staff' || user.role === 'admin';

function Icon({ name }) {
  const paths = {
    grid: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
    bag: 'M6 8V6a6 6 0 0 1 12 0v2m-14 0h16l-1 12H5L4 8Z',
    box: 'm4 7 8-4 8 4-8 4-8-4Zm0 0v10l8 4 8-4V7M12 11v10',
    users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m6-10a4 4 0 1 0-8 0 4 4 0 0 0 8 0Zm8-3a4 4 0 0 1 0 7.75M22 21v-2a4 4 0 0 0-3-3.87',
    search: 'm21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z',
    plus: 'M12 5v14m-7-7h14', arrow: 'M5 12h14m-6-6 6 6-6 6',
    chevron: 'm9 18 6-6-6-6', close: 'M6 6l12 12M18 6 6 18',
    logout: 'M10 17l5-5-5-5m5 5H3m9-9V3h9v18h-9v-1', menu: 'M4 6h16M4 12h16M4 18h16'
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}

function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('mercato-user') || 'null'));
  const [page, setPage] = useState(() => isStaff(JSON.parse(localStorage.getItem('mercato-user') || '{}')) ? 'overview' : 'storefront');
  const [products, setProducts] = useState(starterProducts);
  const [orders, setOrders] = useState(starterOrders);
  const [cart, setCart] = useState([]);
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState('');
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    if (!user) return;
    api.products().then(setProducts).catch(() => {});
    (staff ? api.allOrders() : api.orders(user.id)).then(setOrders).catch(() => {});
  }, [user]);
  useEffect(() => { if (user) localStorage.setItem('mercato-user', JSON.stringify(user)); else localStorage.removeItem('mercato-user'); }, [user]);

  if (!user) return <Auth onLogin={setUser} />;
  const staff = isStaff(user);
  const go = (next) => { setPage(next); setMobileNav(false); };
  const addToCart = (product) => {
    setCart((items) => items.some((item) => item.id === product.id)
      ? items.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      : [...items, { ...product, quantity: 1 }]);
    setNotice(`${product.name} added to your bag`);
  };
  const total = cart.reduce((sum, item) => sum + Number(item.current_price) * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const placeOrder = async () => {
    try {
      const created = await api.createOrder({ user_id: user.id, status: 'pending' });
      for (const item of cart) await api.addItem({ order_id: created.id, product_id: item.id, quantity: item.quantity });
      setOrders((current) => [{
        ...created,
        total_price: total,
        items: cartCount
      }, ...current]);
      api.products().then(setProducts).catch(() => {});
      setNotice('Order created. It is now in your order history.');
    } catch (error) { setNotice(error.message); return; }
    setCart([]); go('orders');
  };
  const visiblePage = !staff && ['overview', 'inventory', 'customers', 'team'].includes(page) ? 'storefront' : page;
  const initials = user.username.slice(0, 2).toUpperCase();
  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? 'is-open' : ''}`}>
      <div className="brand"><span className="brand-mark">M</span><span>mercato</span></div>
      <p className="eyebrow nav-label">{staff ? 'Store workspace' : 'My shopping'}</p>
      <nav>
        {staff && <NavItem icon="grid" label="Overview" active={visiblePage === 'overview'} onClick={() => go('overview')} />}
        <NavItem icon="bag" label="Storefront" active={visiblePage === 'storefront'} onClick={() => go('storefront')} />
        <NavItem icon="box" label="My orders" active={visiblePage === 'orders'} onClick={() => go('orders')} />
        {staff && <><NavItem icon="users" label="Customers" active={visiblePage === 'customers'} onClick={() => go('customers')} /><p className="eyebrow nav-label secondary-label">Manage</p><NavItem icon="box" label="Inventory" active={visiblePage === 'inventory'} onClick={() => go('inventory')} /><NavItem icon="users" label="Team access" active={visiblePage === 'team'} onClick={() => go('team')} /></>}
      </nav>
      <div className="sidebar-bottom"><button className="user-mini" onClick={() => go('profile')}><div className="avatar">{initials}</div><div><strong>{user.username}</strong><span>{user.role}</span></div><span className="profile-link">Profile</span></button><button className="logout-button" aria-label="Log out" onClick={() => setUser(null)}><Icon name="logout" /></button></div>
    </aside>
    {mobileNav && <button className="scrim" onClick={() => setMobileNav(false)} aria-label="Close navigation" />}
    <main className="main-content">
      <header className="topbar"><button className="menu-toggle" onClick={() => setMobileNav(true)}><Icon name="menu" /></button><div className="breadcrumbs"><span>{staff ? 'Workspace' : 'Shop'}</span><b>/</b><strong>{visiblePage[0].toUpperCase() + visiblePage.slice(1)}</strong></div><div className="top-actions"><div className="top-search"><Icon name="search" /><input value={query} onChange={(e) => { setQuery(e.target.value); if (visiblePage !== 'storefront') go('storefront'); }} placeholder="Search products" aria-label="Search products" /></div><button className="cart-button" onClick={() => go('cart')}><Icon name="bag" /><span>{cartCount}</span></button><button className="avatar avatar-small" onClick={() => go('profile')} aria-label="Open profile">{initials}</button></div></header>
      {notice && <button className="notice" onClick={() => setNotice('')}>{notice}<Icon name="close" /></button>}
      {visiblePage === 'overview' && <Overview products={products} orders={orders} onNavigate={go} />}
      {visiblePage === 'storefront' && <Storefront products={products} query={query} onAdd={addToCart} />}
      {visiblePage === 'orders' && <Orders orders={orders} staff={staff} onNavigate={go} onCancel={async (id) => { try { const updated = await api.cancelOrder(id); setOrders((current) => current.map((order) => order.id === id ? updated : order)); api.products().then(setProducts).catch(() => {}); setNotice('Order canceled and stock restored.'); } catch (error) { setNotice(error.message); } }} onStatus={async (id, status) => { try { const updated = await api.updateOrderStatus(id, status); setOrders((current) => current.map((order) => order.id === id ? updated : order)); if (status === 'canceled') api.products().then(setProducts).catch(() => {}); setNotice('Order status updated.'); } catch (error) { setNotice(error.message); } }} />}
      {visiblePage === 'cart' && <Cart cart={cart} total={total} onChange={setCart} onPlaceOrder={placeOrder} onNavigate={go} />}
      {visiblePage === 'profile' && <Profile user={user} onSave={(next) => { setUser(next); setNotice('Profile updated'); }} />}
      {staff && visiblePage === 'inventory' && <Inventory products={products} onCreate={async (product) => { try { const created = await api.createProduct(product); setProducts((current) => [created, ...current]); setNotice('Product added to inventory'); } catch (error) { setNotice(error.message); } }} onDelete={async (id) => { try { await api.deleteProduct(id); setProducts((current) => current.filter((product) => product.id !== id)); } catch (error) { setNotice(error.message); } }} />}
      {staff && visiblePage === 'customers' && <Customers onNotice={setNotice} />}
      {staff && visiblePage === 'team' && <Team />}
    </main>
  </div>;
}

function NavItem({ icon, label, active, onClick }) { return <button className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}><Icon name={icon} /><span>{label}</span></button>; }
function Auth({ onLogin }) {
  const [mode, setMode] = useState('login'); const [form, setForm] = useState({ username: '', password: '' }); const [error, setError] = useState('');
  const submit = async (event) => { event.preventDefault(); setError(''); try { const result = mode === 'login' ? await api.login(form) : await api.signup(form); onLogin(result.user || result); } catch (err) { setError(err.message); } };
  return <div className="auth-shell"><div className="auth-brand"><span className="brand-mark">M</span><span>mercato</span></div><div className="auth-card"><p className="eyebrow">{mode === 'login' ? 'Welcome back' : 'Create a customer account'}</p><h1>{mode === 'login' ? 'Sign in to your store.' : 'Shop with your own account.'}</h1><p className="auth-copy">{mode === 'login' ? 'Customers enter the shopping site. Staff accounts enter the management workspace automatically.' : 'Save your cart, follow orders, and manage your profile.'}</p><form onSubmit={submit}><label>Username<input required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></label><label>Password<input required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>{error && <p className="form-error">{error}</p>}<button className="button button-dark full">{mode === 'login' ? 'Sign in' : 'Create account'} <Icon name="arrow" /></button></form><button className="auth-switch" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>{mode === 'login' ? 'Need an account? Create one' : 'Already have an account? Sign in'}</button></div><p className="auth-footer">A considered workspace for modern commerce.</p></div>;
}
function PageIntro({ eyebrow, title, copy, action }) { return <div className="page-intro"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{copy && <p className="intro-copy">{copy}</p>}</div>{action}</div>; }
function Overview({ products, orders, onNavigate }) { return <div className="page"><PageIntro eyebrow="Store workspace" title="Good morning." copy="Manage products, customers, and fulfillment from one place." action={<button className="button button-dark" onClick={() => onNavigate('inventory')}><Icon name="plus" /> Add product</button>} /><section className="metric-grid"><Metric label="Products" value={products.length} change="Active catalog" /><Metric label="Orders" value={orders.length} change="All time" /><Metric label="Pending orders" value={orders.filter((o) => o.status === 'pending').length} change="Needs attention" tone="orange" /><Metric label="Low stock" value={products.filter((p) => p.stock_quantity < 10).length} change="Review inventory" tone="orange" /></section><section className="panel table-panel"><div className="panel-heading"><div><p className="eyebrow">Recent activity</p><h2>Latest orders</h2></div><button className="text-button" onClick={() => onNavigate('orders')}>View all <Icon name="arrow" /></button></div><OrderTable orders={orders.slice(0, 5)} detailed /></section></div>; }
function Metric({ label, value, change, tone }) { return <div className="metric-card"><p>{label}</p><strong>{value}</strong><span className={tone}>{change}</span></div>; }
function Storefront({ products, query, onAdd }) { const [category, setCategory] = useState('All'); const categories = ['All', ...new Set(products.map((p) => p.category).filter(Boolean))]; const filtered = products.filter((p) => (category === 'All' || p.category === category) && `${p.name} ${p.description} ${p.category}`.toLowerCase().includes(query.toLowerCase())); return <div className="page"><PageIntro eyebrow="Catalog" title="Storefront" copy="Find something considered for everyday life." /><div className="storefront-tabs">{categories.map((item) => <button key={item} className={category === item ? 'selected' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div><div className="product-grid">{filtered.map((product, index) => <article className="product-card" key={product.id}><div className={`product-art art-${index % 6}`}><span className="category-tag">{product.category}</span><div className="art-shape">{product.name.slice(0, 1)}</div><button className="quick-add" onClick={() => onAdd(product)} aria-label={`Add ${product.name}`}><Icon name="plus" /></button></div><div className="card-details"><div><h3>{product.name}</h3><p>{product.description}</p></div><strong>{money(product.current_price)}</strong></div><small>{product.stock_quantity} in stock</small></article>)}</div>{!filtered.length && <div className="empty-state panel"><h2>No products found</h2><p>Try a different search term or category.</p></div>}</div>; }
function Orders({ orders, staff, onNavigate, onCancel, onStatus }) { return <div className="page"><PageIntro eyebrow={staff ? 'Fulfillment' : 'Your history'} title="Orders" copy={staff ? 'Update order status as orders move through fulfillment.' : 'Track everything you have purchased.'} action={<button className="button button-dark" onClick={() => onNavigate('storefront')}><Icon name="bag" /> Continue shopping</button>} /><div className="panel table-panel"><OrderTable orders={orders} detailed staff={staff} onCancel={onCancel} onStatus={onStatus} /></div></div>; }
function OrderTable({ orders, detailed, staff, onCancel, onStatus }) { return <div className="table-wrap"><table><thead><tr><th>Order</th><th>Date</th>{detailed && <th>Items</th>}<th>Total</th><th>Status</th><th>Action</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id}><td><strong className="order-id">#{order.id}</strong></td><td>{date(order.timestamp)}</td>{detailed && <td>{order.items || 1}</td>}<td><strong>{money(order.total_price)}</strong></td><td>{staff && order.status === 'pending' ? <select value={order.status} onChange={(event) => onStatus(order.id, event.target.value)}><option value="pending">Pending</option><option value="completed">Completed</option><option value="canceled">Canceled</option></select> : <Status status={order.status} />}</td><td>{!staff && order.status === 'pending' && <button className="text-button" onClick={() => onCancel(order.id)}>Cancel</button>}</td></tr>)}</tbody></table></div>; }
function Status({ status }) { return <span className={`status ${status}`}><i />{status}</span>; }
function Cart({ cart, total, onChange, onPlaceOrder, onNavigate }) { return <div className="page cart-page"><PageIntro eyebrow="Your selection" title="Shopping bag" copy={`${cart.reduce((sum, item) => sum + item.quantity, 0)} items ready for checkout.`} action={<button className="text-button" onClick={() => onNavigate('storefront')}><Icon name="arrow" /> Continue shopping</button>} />{cart.length ? <div className="cart-layout"><div className="panel cart-items">{cart.map((item) => <div className="cart-item" key={item.id}><div className="cart-art">{item.name.slice(0, 1)}</div><div className="cart-item-info"><h3>{item.name}</h3><span>{item.category}</span><div className="quantity"><button onClick={() => onChange(cart.map((x) => x.id === item.id ? { ...x, quantity: Math.max(1, x.quantity - 1) } : x))}>−</button><b>{item.quantity}</b><button onClick={() => onChange(cart.map((x) => x.id === item.id ? { ...x, quantity: x.quantity + 1 } : x))}>+</button></div></div><strong>{money(item.current_price * item.quantity)}</strong></div>)}</div><aside className="panel summary"><p className="eyebrow">Summary</p><h2>Order total</h2><div className="summary-total"><span>Total</span><strong>{money(total)}</strong></div><button className="button button-dark full" onClick={onPlaceOrder}>Create order <Icon name="arrow" /></button></aside></div> : <div className="empty-state panel"><h2>Your bag is waiting</h2><p>Add something from the storefront to get started.</p><button className="button button-dark" onClick={() => onNavigate('storefront')}>Browse products <Icon name="arrow" /></button></div>}</div>; }
function Profile({ user, onSave }) { const [form, setForm] = useState({ username: user.username, password: '' }); const [error, setError] = useState(''); const save = async (event) => { event.preventDefault(); setError(''); try { const updated = await api.updateProfile(user.id, { username: form.username, ...(form.password ? { password: form.password } : {}) }); onSave({ ...user, ...updated }); setForm({ username: updated.username, password: '' }); } catch (err) { setError(err.message); } }; return <div className="page"><PageIntro eyebrow="Account settings" title="Your profile" copy="Update your account information and password." /><form className="panel profile-form" onSubmit={save}><div className="profile-heading"><div className="avatar profile-avatar">{user.username.slice(0, 2).toUpperCase()}</div><div><h2>{user.username}</h2><p>{user.role} account</p></div></div><label>Username<input required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></label><label>New password<input type="password" minLength="6" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Leave blank to keep current password" /></label>{error && <p className="form-error">{error}</p>}<button className="button button-dark">Save changes</button></form></div>; }
function Inventory({ products, onCreate, onDelete }) { const [form, setForm] = useState({ name: '', description: '', current_price: '', stock_quantity: '' }); return <div className="page"><PageIntro eyebrow="Catalog management" title="Inventory" copy="Add or remove products from the storefront." /><div className="inventory-layout"><div className="panel table-panel"><div className="panel-heading"><h2>{products.length} active products</h2></div><div className="table-wrap"><table><thead><tr><th>Product</th><th>Price</th><th>Stock</th><th></th></tr></thead><tbody>{products.map((p) => <tr key={p.id}><td><strong>{p.name}</strong></td><td>{money(p.current_price)}</td><td>{p.stock_quantity}</td><td><button className="row-action" onClick={() => onDelete(p.id)} aria-label={`Remove ${p.name}`}><Icon name="close" /></button></td></tr>)}</tbody></table></div></div><form className="panel add-product" onSubmit={(e) => { e.preventDefault(); onCreate({ ...form, current_price: Number(form.current_price), stock_quantity: Number(form.stock_quantity) }); setForm({ name: '', description: '', current_price: '', stock_quantity: '' }); }}><p className="eyebrow">Quick action</p><h2>Add product</h2><label>Name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label><label>Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label><div className="form-row"><label>Price<input required type="number" min="0" step=".01" value={form.current_price} onChange={(e) => setForm({ ...form, current_price: e.target.value })} /></label><label>Stock<input required type="number" min="0" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} /></label></div><button className="button button-dark full"><Icon name="plus" /> Add to catalog</button></form></div></div>; }
function Customers({ onNotice }) { const [users, setUsers] = useState([]); useEffect(() => { api.users().then(setUsers).catch((error) => onNotice(error.message)); }, [onNotice]); const remove = async (id) => { try { await api.deleteUser(id); setUsers((current) => current.filter((user) => user.id !== id)); } catch (error) { onNotice(error.message); } }; return <div className="page"><PageIntro eyebrow="Relationships" title="Customers" copy="Manage customer accounts." /><div className="panel table-panel"><div className="table-wrap"><table><thead><tr><th>Username</th><th>Role</th><th>Joined</th><th></th></tr></thead><tbody>{users.map((customer) => <tr key={customer.id}><td><strong>{customer.username}</strong></td><td>{customer.role}</td><td>{date(customer.created_at)}</td><td>{customer.role === 'user' && <button className="row-action" onClick={() => remove(customer.id)}><Icon name="close" /></button>}</td></tr>)}</tbody></table></div></div></div>; }
function Team() { return <div className="page"><PageIntro eyebrow="Workspace settings" title="Team access" copy="Staff accounts use the management workspace." /><div className="empty-state panel"><div className="empty-icon"><Icon name="users" /></div><h2>Staff access is role-based</h2><p>Users see the storefront and their own history. Staff and admin accounts see inventory, customers, and statistics.</p></div></div>; }

createRoot(document.getElementById('root')).render(<App />);
