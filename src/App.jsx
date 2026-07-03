import { useEffect, useMemo, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const emptyForm = {
  id: '',
  name: '',
  description: '',
  price: '',
  quantity: '',
};

function App() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/products`);
      if (!response.ok) throw new Error('Unable to load products');
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const totalInventoryValue = useMemo(() => {
    return products.reduce((sum, product) => sum + Number(product.price || 0) * Number(product.quantity || 0), 0);
  }, [products]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const payload = {
      id: Number(form.id),
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      quantity: Number(form.quantity),
    };

    try {
      const url = editingId ? `${API_URL}/products/${editingId}` : `${API_URL}/products`;
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || errorData?.error || 'Request failed');
      }

      setMessage({
        type: 'success',
        text: editingId ? 'Product updated successfully.' : 'Product added successfully.',
      });
      resetForm();
      await fetchProducts();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setForm({
      id: String(product.id),
      name: product.name,
      description: product.description,
      price: String(product.price),
      quantity: String(product.quantity),
    });
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Unable to delete product');
      setMessage({ type: 'success', text: 'Product deleted successfully.' });
      await fetchProducts();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  return (
    <div className="app-shell">
      <header className="hero-card">
        <div>
          <p className="eyebrow">Simple inventory dashboard</p>
          <h1>Manage your product catalog with ease</h1>
          <p className="hero-text">
            Add, update, and review products through a clean interface connected directly to your FastAPI backend.
          </p>
        </div>
        <div className="hero-badge">
          <span>{products.length}</span>
          <small>products</small>
        </div>
      </header>

      <section className="stats-grid">
        <article className="stat-card">
          <h3>Total products</h3>
          <strong>{products.length}</strong>
        </article>
        <article className="stat-card">
          <h3>Inventory value</h3>
          <strong>₹{totalInventoryValue.toFixed(2)}</strong>
        </article>
      </section>

      {message.text ? (
        <div className={`message ${message.type}`}>{message.text}</div>
      ) : null}

      <section className="content-grid">
        <form className="panel" onSubmit={handleSubmit}>
          <div className="panel-header">
            <h2>{editingId ? 'Edit product' : 'Add a product'}</h2>
            {editingId ? <button type="button" className="ghost-button" onClick={resetForm}>Cancel</button> : null}
          </div>

          <label>
            Product ID
            <input name="id" type="number" required value={form.id} onChange={handleChange} />
          </label>
          <label>
            Name
            <input name="name" type="text" required value={form.name} onChange={handleChange} />
          </label>
          <label>
            Description
            <textarea name="description" rows="2" required value={form.description} onChange={handleChange} />
          </label>
          <div className="split-fields">
            <label>
              Price
              <input name="price" type="number" step="0.01" required value={form.price} onChange={handleChange} />
            </label>
            <label>
              Quantity
              <input name="quantity" type="number" required value={form.quantity} onChange={handleChange} />
            </label>
          </div>
          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? 'Saving...' : editingId ? 'Update product' : 'Save product'}
          </button>
        </form>

        <div className="panel">
          <div className="panel-header">
            <h2>Products</h2>
            <button className="ghost-button" onClick={fetchProducts}>Refresh</button>
          </div>

          {loading && products.length === 0 ? (
            <p className="empty-state">Loading products...</p>
          ) : products.length === 0 ? (
            <p className="empty-state">No products yet. Add one to get started.</p>
          ) : (
            <div className="product-list">
              {products.map((product) => (
                <article key={product.id} className="product-card">
                  <div>
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>
                    <div className="meta-row">
                      <span>Price: ₹{Number(product.price).toFixed(2)}</span>
                      <span>Qty: {product.quantity}</span>
                    </div>
                  </div>
                  <div className="actions">
                    <button type="button" className="ghost-button" onClick={() => handleEdit(product)}>Edit</button>
                    <button type="button" className="danger-button" onClick={() => handleDelete(product.id)}>Delete</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default App;
