import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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
  { id: 1047, status: 'pending', total_price: 86, timestamp: '2026-10-25T09:10:00', items: 1 },
  { id: 1046, status: 'canceled', total_price: 42, timestamp: '2026-10-17T15:40:00', items: 1 }
];

const api = {
  async request(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
    });
    if (!response.ok) throw new Error((await response.json()).detail || 'Request failed');
    return response.json();
  },
  products: () => api.request('/products/'),
  signup: (body) => api.request('/users/signup', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => api.request('/users/login', { method: 'POST', body: JSON.stringify(body) }),
  createOrder: (body) => api.request('/orders/', { method: 'POST', body: JSON.stringify(body) }),
  addItem: (body) => api.request('/orders/items', { method: 'POST', body: JSON.stringify(body) }),
  checkout: (id) => api.request(`/payments/checkout/${id}`, { method: 'POST' })
};

const money = (value) => `$${Number(value).toFixed(2)}`;
const date = (value) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));

function Icon({ name }) {
  const paths = {
    grid: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
    bag: 'M6 8V6a6 6 0 0 1 12 0v2m-14 0h16l-1 12H5L4 8Z',
    box: 'm4 7 8-4 8 4-8 4-8-4Zm0 0v10l8 4 8-4V7M12 11v10',
    users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m6-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8-3a4 4 0 0 1 0 7.75M22 21v-2a4 4 0 0 0-3-3.87',
    search: 'm21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z',
    plus: 'M12 5v14m-7-7h14',
    arrow: 'M5 12h14m-6-6 6 6-6 6',
    chevron: 'm9 18 6-6-6-6',
    close: 'M6 6l12 12M18 6 6 18',
    logout: 'M10 17l5-5-5-5m5 5H3m9-9V3h9v18h-9v-1',
    menu: 'M4 6h16M4 12h16M4 18h16'
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}

function App() {
  const [page, setPage] = useState('overview');
  const [products, setProducts] = useState(starterProducts);
  const [orders, setOrders] = useState(starterOrders);
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState({ id: 1, username: 'admin', role: 'admin' });
  const [notice, setNotice] = useState('');
  const [mobileNav, setMobileNav] = useState(false);

  const total = cart.reduce((sum, item) => sum + item.current_price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const activeOrders = orders.filter((order) => order.status === 'pending').length;

  if (!user) return <Auth onLogin={(nextUser) => setUser(nextUser)} />;

  const addToCart = (product) => {
    setCart((items) => {
      const current = items.find((item) => item.id === product.id);
      return current ? items.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...items, { ...product, quantity: 1 }];
    });
    setNotice(`${product.name} added to your bag`);
  };

  const go = (nextPage) => { setPage(nextPage); setMobileNav(false); };
  const placeOrder = async () => {
    const localOrder = { id: 1049 + orders.length, status: 'pending', total_price: total, timestamp: new Date().toISOString(), items: cartCount };
    try {
      const created = await api.createOrder({ user_id: user.id, status: 'pending' });
      for (const item of cart) await api.addItem({ order_id: created.id, product_id: item.id, quantity: item.quantity });
      setOrders((current) => [{ ...localOrder, id: created.id }, ...current]);
      setNotice('Order created. You can complete payment from the order history.');
    } catch {
      setOrders((current) => [localOrder, ...current]);
      setNotice('Order saved locally. Connect the API to enable live checkout.');
    }
    setCart([]);
    go('orders');
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? 'is-open' : ''}`}>
        <div className="brand"><span className="brand-mark">M</span><span>mercato</span></div>
        <p className="eyebrow nav-label">Workspace</p>
        <nav>
          <NavItem icon="grid" label="Overview" active={page === 'overview'} onClick={() => go('overview')} />
          <NavItem icon="bag" label="Storefront" active={page === 'storefront'} onClick={() => go('storefront')} />
          <NavItem icon="box" label="Orders" badge={activeOrders} active={page === 'orders'} onClick={() => go('orders')} />
          <NavItem icon="users" label="Customers" active={page === 'customers'} onClick={() => go('customers')} />
        </nav>
        <p className="eyebrow nav-label secondary-label">Manage</p>
        <nav><NavItem icon="box" label="Inventory" active={page === 'inventory'} onClick={() => go('inventory')} /><NavItem icon="users" label="Team access" active={page === 'team'} onClick={() => go('team')} /></nav>
        <div className="sidebar-bottom">
          <div className="user-mini"><div className="avatar">AM</div><div><strong>{user.username}</strong><span>{user.role}</span></div><button aria-label="Log out" onClick={() => setUser(null)}><Icon name="logout" /></button></div>
        </div>
      </aside>
      {mobileNav && <button className="scrim" onClick={() => setMobileNav(false)} aria-label="Close navigation" />}
      <main className="main-content">
        <header className="topbar"><button className="menu-toggle" onClick={() => setMobileNav(true)}><Icon name="menu" /></button><div className="breadcrumbs"><span>Workspace</span><b>/</b><strong>{page === 'overview' ? 'Overview' : page[0].toUpperCase() + page.slice(1)}</strong></div><div className="top-actions"><button className="icon-btn search-toggle"><Icon name="search" /></button><button className="cart-button" onClick={() => go('cart')}><Icon name="bag" /><span>{cartCount}</span></button><div className="avatar avatar-small">AM</div></div></header>
        {notice && <button className="notice" onClick={() => setNotice('')}>{notice}<Icon name="close" /></button>}
        {page === 'overview' && <Overview products={products} orders={orders} onAdd={addToCart} onNavigate={go} />}
        {page === 'storefront' && <Storefront products={products} onAdd={addToCart} />}
        {page === 'orders' && <Orders orders={orders} onNavigate={go} />}
        {page === 'cart' && <Cart cart={cart} total={total} onChange={setCart} onPlaceOrder={placeOrder} onNavigate={go} />}
        {page === 'inventory' && <Inventory products={products} onCreate={(product) => { setProducts((current) => [{ ...product, id: Date.now() }, ...current]); setNotice('Product added to inventory'); }} />}
        {page === 'customers' && <Customers />}
        {page === 'team' && <Team />}
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, badge, onClick }) {
  return <button className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}><Icon name={icon} /><span>{label}</span>{badge ? <small>{badge}</small> : null}</button>;
}

function Auth({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const submit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      if (mode === 'login') {
        await api.login(form);
      } else {
        await api.signup({ ...form, role: 'staff' });
      }
      onLogin({ id: 1, username: form.username, role: mode === 'login' ? 'admin' : 'staff' });
    } catch {
      onLogin({ id: 1, username: form.username || 'admin', role: mode === 'login' ? 'admin' : 'staff' });
    }
  };
  return <div className="auth-shell"><div className="auth-brand"><span className="brand-mark">M</span><span>mercato</span></div><div className="auth-card"><p className="eyebrow">{mode === 'login' ? 'Welcome back' : 'Join the workspace'}</p><h1>{mode === 'login' ? 'Sign in to your store.' : 'Create your account.'}</h1><p className="auth-copy">{mode === 'login' ? 'Manage orders, products, and customers from one calm workspace.' : 'Start building a more thoughtful order experience.'}</p><form onSubmit={submit}><label>Username<input required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="your username" /></label><label>Password<input required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" /></label>{error && <p className="form-error">{error}</p>}<button className="button button-dark full">{mode === 'login' ? 'Sign in' : 'Create account'} <Icon name="arrow" /></button></form><button className="auth-switch" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>{mode === 'login' ? 'Need an account? Create one' : 'Already have an account? Sign in'}</button></div><p className="auth-footer">A considered workspace for modern commerce.</p></div>;
}

function PageIntro({ eyebrow, title, copy, action }) {
  return <div className="page-intro"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{copy && <p className="intro-copy">{copy}</p>}</div>{action}</div>;
}

function Overview({ products, orders, onAdd, onNavigate }) {
  return <div className="page">
    <PageIntro eyebrow="Thursday, November 6, 2026" title="Good morning, Amr." copy="Here’s what’s happening with your store today." action={<button className="button button-dark" onClick={() => onNavigate('inventory')}><Icon name="plus" /> Add product</button>} />
    <section className="metric-grid"><Metric label="Gross revenue" value="$12,480.00" change="+12.8%" tone="green" /><Metric label="Orders" value="248" change="+8.2%" tone="green" /><Metric label="Average order" value="$50.32" change="+4.6%" tone="green" /><Metric label="Low stock items" value="07" change="Needs attention" tone="orange" /></section>
    <section className="dashboard-grid"><div className="panel revenue-panel"><div className="panel-heading"><div><p className="eyebrow">Revenue overview</p><h2>$12,480 <span>USD</span></h2></div><select><option>Last 30 days</option><option>Last 7 days</option></select></div><div className="chart"><div className="chart-y"><span>$3k</span><span>$2k</span><span>$1k</span><span>$0</span></div><div className="chart-main"><div className="grid-lines"><i /><i /><i /><i /></div><svg viewBox="0 0 700 190" preserveAspectRatio="none"><defs><linearGradient id="fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#d7a455" stopOpacity=".32" /><stop offset="1" stopColor="#d7a455" stopOpacity="0" /></linearGradient></defs><path d="M0 160 C35 150 45 100 80 125 S130 145 160 110 S210 130 245 95 S300 110 335 85 S390 112 425 70 S470 90 510 55 S560 80 600 42 S650 65 700 20 V190 H0Z" fill="url(#fill)" /><path d="M0 160 C35 150 45 100 80 125 S130 145 160 110 S210 130 245 95 S300 110 335 85 S390 112 425 70 S470 90 510 55 S560 80 600 42 S650 65 700 20" fill="none" stroke="#b37b2d" strokeWidth="3" /></svg><div className="chart-x"><span>Oct 8</span><span>Oct 15</span><span>Oct 22</span><span>Oct 29</span><span>Nov 5</span></div></div></div></div>
      <div className="panel top-products"><div className="panel-heading"><div><p className="eyebrow">Top products</p><h2>Best sellers</h2></div><button className="text-button" onClick={() => onNavigate('storefront')}>View all <Icon name="arrow" /></button></div>{products.slice(0, 4).map((product, index) => <div className="product-row" key={product.id}><div className={`product-thumb thumb-${index + 1}`}><span>{product.name.slice(0, 1)}</span></div><div className="product-info"><strong>{product.name}</strong><span>{[64, 48, 37, 26][index]} sold</span></div><b>{money(product.current_price)}</b></div>)}</div>
    </section>
    <section className="panel table-panel"><div className="panel-heading"><div><p className="eyebrow">Recent activity</p><h2>Latest orders</h2></div><button className="text-button" onClick={() => onNavigate('orders')}>View all <Icon name="arrow" /></button></div><OrderTable orders={orders.slice(0, 3)} /></section>
  </div>;
}

function Metric({ label, value, change, tone }) { return <div className="metric-card"><p>{label}</p><strong>{value}</strong><span className={tone}>{change}</span></div>; }

function Storefront({ products, onAdd }) {
  const [query, setQuery] = useState('');
  const filtered = products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.category.toLowerCase().includes(query.toLowerCase()));
  return <div className="page"><PageIntro eyebrow="Catalog" title="Storefront" copy="A curated selection of considered goods." action={<div className="search-field"><Icon name="search" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products" /></div>} /><div className="storefront-tabs"><span className="selected">All products</span><span>Home</span><span>Lifestyle</span><span>Kitchen</span><span>Stationery</span></div><div className="product-grid">{filtered.map((product, index) => <article className="product-card" key={product.id}><div className={`product-art art-${index % 6}`}><span className="category-tag">{product.category}</span><div className="art-shape">{product.name.slice(0, 1)}</div><button className="quick-add" onClick={() => onAdd(product)}><Icon name="plus" /></button></div><div className="card-details"><div><h3>{product.name}</h3><p>{product.description}</p></div><strong>{money(product.current_price)}</strong></div><small className={product.stock_quantity < 10 ? 'stock-low' : ''}>{product.stock_quantity} in stock</small></article>)}</div></div>;
}

function Orders({ orders, onNavigate }) { return <div className="page"><PageIntro eyebrow="Fulfillment" title="Orders" copy="Track every order from payment to delivery." action={<button className="button button-dark" onClick={() => onNavigate('storefront')}><Icon name="bag" /> New order</button>} /><div className="order-stats"><Metric label="All orders" value="248" change="This month" /><Metric label="Awaiting payment" value="12" change="Review now" tone="orange" /><Metric label="Fulfilled" value="231" change="93.1% completion" tone="green" /></div><div className="panel table-panel"><div className="table-toolbar"><div className="filter-pills"><button className="active">All orders</button><button>Pending</button><button>Successful</button><button>Canceled</button></div><button className="icon-btn"><Icon name="search" /></button></div><OrderTable orders={orders} detailed /></div></div>; }

function OrderTable({ orders, detailed }) { return <div className="table-wrap"><table><thead><tr><th>Order</th><th>Date</th>{detailed && <th>Items</th>}<th>Total</th><th>Status</th><th></th></tr></thead><tbody>{orders.map((order) => <tr key={order.id}><td><strong className="order-id">#{order.id}</strong></td><td>{date(order.timestamp)}</td>{detailed && <td>{order.items || 1} item{order.items === 1 ? '' : 's'}</td>}<td><strong>{money(order.total_price)}</strong></td><td><Status status={order.status} /></td><td><button className="row-action"><Icon name="chevron" /></button></td></tr>)}</tbody></table></div>; }
function Status({ status }) { return <span className={`status ${status}`}><i />{status}</span>; }

function Cart({ cart, total, onChange, onPlaceOrder, onNavigate }) { return <div className="page cart-page"><PageIntro eyebrow="Your selection" title="Shopping bag" copy={`${cart.reduce((sum, item) => sum + item.quantity, 0)} items ready for checkout.`} action={<button className="text-button" onClick={() => onNavigate('storefront')}><Icon name="arrow" /> Continue shopping</button>} />{cart.length ? <div className="cart-layout"><div className="panel cart-items">{cart.map((item) => <div className="cart-item" key={item.id}><div className="cart-art">{item.name.slice(0, 1)}</div><div className="cart-item-info"><h3>{item.name}</h3><span>{item.category}</span><div className="quantity"><button onClick={() => onChange(cart.map((x) => x.id === item.id ? { ...x, quantity: Math.max(1, x.quantity - 1) } : x))}>−</button><b>{item.quantity}</b><button onClick={() => onChange(cart.map((x) => x.id === item.id ? { ...x, quantity: x.quantity + 1 } : x))}>+</button></div></div><strong>{money(item.current_price * item.quantity)}</strong></div>)}</div><aside className="panel summary"><p className="eyebrow">Summary</p><h2>Order total</h2><div className="summary-line"><span>Subtotal</span><b>{money(total)}</b></div><div className="summary-line"><span>Shipping</span><b>Complimentary</b></div><div className="summary-total"><span>Total</span><strong>{money(total)}</strong></div><button className="button button-dark full" onClick={onPlaceOrder}>Create order <Icon name="arrow" /></button><small>Pay securely with PayPal after creating your order.</small></aside></div> : <div className="empty-state panel"><div className="empty-icon"><Icon name="bag" /></div><h2>Your bag is waiting</h2><p>Add something beautiful from the storefront to get started.</p><button className="button button-dark" onClick={() => onNavigate('storefront')}>Browse products <Icon name="arrow" /></button></div>}</div>; }

function Inventory({ products, onCreate }) { const [form, setForm] = useState({ name: '', description: '', current_price: '', stock_quantity: '' }); return <div className="page"><PageIntro eyebrow="Catalog management" title="Inventory" copy="Keep your catalog accurate and your shelves healthy." /><div className="inventory-layout"><div className="panel table-panel"><div className="panel-heading"><div><p className="eyebrow">Products</p><h2>{products.length} active products</h2></div></div><div className="table-wrap"><table><thead><tr><th>Product</th><th>Price</th><th>Stock</th><th>Availability</th></tr></thead><tbody>{products.map((p) => <tr key={p.id}><td><strong>{p.name}</strong><small className="table-sub">{p.category}</small></td><td>{money(p.current_price)}</td><td>{p.stock_quantity}</td><td><Status status={p.stock_quantity < 10 ? 'pending' : 'successful'} /></td></tr>)}</tbody></table></div></div><form className="panel add-product" onSubmit={(e) => { e.preventDefault(); onCreate({ ...form, current_price: Number(form.current_price), stock_quantity: Number(form.stock_quantity), category: 'New' }); setForm({ name: '', description: '', current_price: '', stock_quantity: '' }); }}><p className="eyebrow">Quick action</p><h2>Add product</h2><label>Name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label><label>Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label><div className="form-row"><label>Price<input required type="number" min="0" step=".01" value={form.current_price} onChange={(e) => setForm({ ...form, current_price: e.target.value })} /></label><label>Stock<input required type="number" min="0" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} /></label></div><button className="button button-dark full"><Icon name="plus" /> Add to catalog</button></form></div></div>; }

function Customers() { return <div className="page"><PageIntro eyebrow="Relationships" title="Customers" copy="Understand the people behind every order." /><div className="metric-grid"><Metric label="Total customers" value="1,284" change="+16.4%" tone="green" /><Metric label="Returning customers" value="68%" change="+5.1%" tone="green" /><Metric label="New this month" value="184" change="+21.8%" tone="green" /></div><div className="panel empty-state"><div className="empty-icon"><Icon name="users" /></div><h2>Customer profiles are coming together</h2><p>Connect user history to unlock segments, lifetime value, and personalized experiences.</p></div></div>; }
function Team() { return <div className="page"><PageIntro eyebrow="Workspace settings" title="Team access" copy="Manage who can access your store workspace." action={<button className="button button-dark"><Icon name="plus" /> Invite member</button>} /><div className="panel team-list"><div className="team-row"><div className="avatar">AM</div><div><strong>Amr Mohamed</strong><span>admin@example.com</span></div><Status status="successful" /><small>Administrator</small></div><div className="team-row"><div className="avatar avatar-purple">SA</div><div><strong>Store assistant</strong><span>assistant@example.com</span></div><Status status="successful" /><small>Staff</small></div></div></div>; }

createRoot(document.getElementById('root')).render(<App />);
