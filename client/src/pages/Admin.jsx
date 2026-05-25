import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProperties, createProperty, updateProperty, deleteProperty } from '../services/api';

const PROPERTY_TYPES = ['Apartment', 'Villa', 'Plot', 'House', 'Commercial', 'Penthouse'];
const STATUSES = ['For Sale', 'For Rent', 'Sold', 'Rented'];
const AMENITY_OPTIONS = ['Parking', 'Gym', 'Pool', 'Security', 'Lift', 'Garden', 'Power Backup', 'Club House', 'Children Play Area', 'CCTV'];

const defaultForm = {
  title: '', description: '', price: '', location: '', city: '',
  state: 'Andhra Pradesh', propertyType: 'Apartment', status: 'For Sale',
  bedrooms: '', bathrooms: '', area: '', amenities: [], featured: false,
};

// ── Toast helper ─────────────────────────────────────────────
function Toast({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>{t.msg}</div>
      ))}
    </div>
  );
}

// ── Format price ─────────────────────────────────────────────
function formatPrice(price) {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
  return `₹${price?.toLocaleString('en-IN')}`;
}

export default function Admin() {
  const navigate = useNavigate();
  const admin = JSON.parse(localStorage.getItem('srisai_admin') || '{}');

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('properties'); // 'properties' | 'add' | 'edit'
  const [form, setForm] = useState(defaultForm);
  const [editId, setEditId] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [toasts, setToasts] = useState([]);
  const fileRef = useRef();

  const addToast = (msg, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  };

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const res = await getProperties({ limit: 100 });
      setProperties(res.data.properties || []);
    } catch {
      addToast('Failed to load properties', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProperties(); }, []);

  const logout = () => {
    localStorage.removeItem('srisai_token');
    localStorage.removeItem('srisai_admin');
    navigate('/login');
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const toggleAmenity = (amenity) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles((prev) => [...prev, ...files]);
    const previews = files.map((f) => URL.createObjectURL(f));
    setImagePreviews((prev) => [...prev, ...previews]);
  };

  const removeNewImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (public_id) => {
    setRemovedImages((prev) => [...prev, public_id]);
    setExistingImages((prev) => prev.filter((img) => img.public_id !== public_id));
  };

  const startEdit = (property) => {
    setEditId(property._id);
    setForm({
      title: property.title,
      description: property.description,
      price: property.price,
      location: property.location,
      city: property.city,
      state: property.state || 'Andhra Pradesh',
      propertyType: property.propertyType,
      status: property.status,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      area: property.area,
      amenities: property.amenities || [],
      featured: property.featured || false,
    });
    setExistingImages(property.images || []);
    setImageFiles([]);
    setImagePreviews([]);
    setRemovedImages([]);
    setTab('edit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setForm(defaultForm);
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImages([]);
    setRemovedImages([]);
    setEditId(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.city || !form.area) {
      addToast('Please fill in all required fields', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'amenities') fd.append(k, v.join(','));
        else fd.append(k, v);
      });
      imageFiles.forEach((f) => fd.append('images', f));
      if (removedImages.length) removedImages.forEach((id) => fd.append('removeImages', id));

      if (editId) {
        await updateProperty(editId, fd);
        addToast('Property updated successfully!');
      } else {
        await createProperty(fd);
        addToast('Property created successfully!');
      }

      resetForm();
      setTab('properties');
      await fetchProperties();
    } catch (err) {
      addToast(err.response?.data?.message || 'Operation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteProperty(id);
      setDeleteId(null);
      addToast('Property deleted successfully!');
      await fetchProperties();
    } catch {
      addToast('Failed to delete property', 'error');
    }
  };

  // ── Stats ──────────────────────────────────────────────────
  const stats = {
    total: properties.length,
    forSale: properties.filter((p) => p.status === 'For Sale').length,
    forRent: properties.filter((p) => p.status === 'For Rent').length,
    featured: properties.filter((p) => p.featured).length,
  };

  return (
    <div style={S.page}>
      <Toast toasts={toasts} />

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside style={S.sidebar}>
        <div style={S.sidebarLogo}>
          <span style={{ fontSize: 28 }}>🏛️</span>
          <div>
            <div style={S.sidebarBrand}>Sri Sai</div>
            <div style={S.sidebarSub}>Real Estate</div>
          </div>
        </div>

        <nav style={S.nav}>
          {[
            { key: 'properties', icon: '🏠', label: 'Properties' },
            { key: 'add', icon: '➕', label: 'Add Property' },
          ].map((item) => (
            <button
              key={item.key}
              style={{ ...S.navBtn, ...(tab === item.key || (tab === 'edit' && item.key === 'add') ? S.navBtnActive : {}) }}
              onClick={() => {
                if (item.key === 'add') { resetForm(); }
                setTab(item.key);
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div style={S.sidebarFooter}>
          <div style={S.adminInfo}>
            <div style={S.adminAvatar}>A</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#E8C97A' }}>Admin</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{admin.email}</div>
            </div>
          </div>
          <button onClick={logout} style={S.logoutBtn}>⎋ Logout</button>
          <a href="/" style={S.viewSiteBtn}>🌐 View Site</a>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────── */}
      <main style={S.main}>
        {/* Header */}
        <header style={S.header}>
          <div>
            <h1 style={S.pageTitle}>
              {tab === 'properties' ? 'All Properties' : tab === 'edit' ? 'Edit Property' : 'Add New Property'}
            </h1>
            <p style={S.pageSubtitle}>
              {tab === 'properties' ? `${stats.total} total properties listed` : 'Fill in the details below'}
            </p>
          </div>
          {tab === 'properties' && (
            <button className="btn btn-primary" onClick={() => { resetForm(); setTab('add'); }}>
              + Add Property
            </button>
          )}
        </header>

        {/* Stats bar */}
        {tab === 'properties' && (
          <div style={S.statsBar}>
            {[
              { label: 'Total', val: stats.total, icon: '🏘️' },
              { label: 'For Sale', val: stats.forSale, icon: '🏷️' },
              { label: 'For Rent', val: stats.forRent, icon: '🔑' },
              { label: 'Featured', val: stats.featured, icon: '⭐' },
            ].map((s) => (
              <div key={s.label} style={S.statCard}>
                <span style={S.statIcon}>{s.icon}</span>
                <div style={S.statNum}>{s.val}</div>
                <div style={S.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── Properties List ──────────────────────────────── */}
        {tab === 'properties' && (
          <div style={S.content}>
            {loading ? (
              <div className="spinner" />
            ) : properties.length === 0 ? (
              <div style={S.empty}>
                <div style={{ fontSize: 64 }}>🏗️</div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", marginTop: 16 }}>No properties yet</h3>
                <p style={{ color: '#718096', marginTop: 8 }}>Add your first property to get started</p>
                <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => { resetForm(); setTab('add'); }}>
                  + Add Property
                </button>
              </div>
            ) : (
              <div style={S.propertyGrid}>
                {properties.map((p) => (
                  <div key={p._id} style={S.propCard}>
                    <div style={S.propImgWrap}>
                      {p.images?.length > 0 ? (
                        <img src={p.images[0].url} alt={p.title} style={S.propImg} />
                      ) : (
                        <div style={S.propImgPlaceholder}>🏠</div>
                      )}
                      <span style={{ ...S.propBadge, ...(p.status === 'For Rent' ? S.badgeRent : p.status === 'Sold' ? S.badgeSold : S.badgeSale) }}>
                        {p.status}
                      </span>
                      {p.featured && <span style={S.featuredBadge}>⭐ Featured</span>}
                    </div>
                    <div style={S.propBody}>
                      <div style={S.propType}>{p.propertyType}</div>
                      <h3 style={S.propTitle}>{p.title}</h3>
                      <div style={S.propLocation}>📍 {p.location}, {p.city}</div>
                      <div style={S.propPrice}>{formatPrice(p.price)}</div>
                      <div style={S.propMeta}>
                        {p.bedrooms > 0 && <span>🛏 {p.bedrooms} Bed</span>}
                        {p.bathrooms > 0 && <span>🚿 {p.bathrooms} Bath</span>}
                        <span>📐 {p.area?.toLocaleString()} sq.ft</span>
                      </div>
                    </div>
                    <div style={S.propActions}>
                      <button style={S.editBtn} onClick={() => startEdit(p)}>✏️ Edit</button>
                      <button style={S.deleteBtn} onClick={() => setDeleteId(p._id)}>🗑️ Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Add / Edit Form ──────────────────────────────── */}
        {(tab === 'add' || tab === 'edit') && (
          <div style={S.content}>
            <form onSubmit={handleSubmit} style={S.form}>
              {/* Basic Info */}
              <div style={S.formSection}>
                <h3 style={S.sectionTitle}>📋 Basic Information</h3>
                <div style={S.formGrid2}>
                  <div style={S.field}>
                    <label style={S.label}>Title *</label>
                    <input name="title" value={form.title} onChange={handleFormChange} style={S.input} placeholder="e.g. Luxury Villa in Vijayawada" required />
                  </div>
                  <div style={S.field}>
                    <label style={S.label}>Price (₹) *</label>
                    <input name="price" type="number" value={form.price} onChange={handleFormChange} style={S.input} placeholder="e.g. 5000000" required />
                  </div>
                  <div style={S.field}>
                    <label style={S.label}>Property Type *</label>
                    <select name="propertyType" value={form.propertyType} onChange={handleFormChange} style={S.input}>
                      {PROPERTY_TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div style={S.field}>
                    <label style={S.label}>Status *</label>
                    <select name="status" value={form.status} onChange={handleFormChange} style={S.input}>
                      {STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div style={S.field}>
                  <label style={S.label}>Description *</label>
                  <textarea name="description" value={form.description} onChange={handleFormChange} style={{ ...S.input, minHeight: 100, resize: 'vertical' }} placeholder="Describe the property..." />
                </div>
              </div>

              {/* Location */}
              <div style={S.formSection}>
                <h3 style={S.sectionTitle}>📍 Location</h3>
                <div style={S.formGrid2}>
                  <div style={S.field}>
                    <label style={S.label}>Address / Area *</label>
                    <input name="location" value={form.location} onChange={handleFormChange} style={S.input} placeholder="e.g. Benz Circle, Vijayawada" required />
                  </div>
                  <div style={S.field}>
                    <label style={S.label}>City *</label>
                    <input name="city" value={form.city} onChange={handleFormChange} style={S.input} placeholder="e.g. Vijayawada" required />
                  </div>
                  <div style={S.field}>
                    <label style={S.label}>State</label>
                    <input name="state" value={form.state} onChange={handleFormChange} style={S.input} placeholder="Andhra Pradesh" />
                  </div>
                </div>
              </div>

              {/* Details */}
              <div style={S.formSection}>
                <h3 style={S.sectionTitle}>🏗️ Property Details</h3>
                <div style={S.formGrid3}>
                  <div style={S.field}>
                    <label style={S.label}>Bedrooms</label>
                    <input name="bedrooms" type="number" min="0" value={form.bedrooms} onChange={handleFormChange} style={S.input} placeholder="0" />
                  </div>
                  <div style={S.field}>
                    <label style={S.label}>Bathrooms</label>
                    <input name="bathrooms" type="number" min="0" value={form.bathrooms} onChange={handleFormChange} style={S.input} placeholder="0" />
                  </div>
                  <div style={S.field}>
                    <label style={S.label}>Area (sq.ft) *</label>
                    <input name="area" type="number" value={form.area} onChange={handleFormChange} style={S.input} placeholder="e.g. 1200" required />
                  </div>
                </div>
                <div style={S.field}>
                  <label style={S.label}>Featured Property</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginTop: 4 }}>
                    <input type="checkbox" name="featured" checked={form.featured} onChange={handleFormChange} style={{ width: 18, height: 18 }} />
                    <span style={{ fontSize: 14, color: '#4A5568' }}>Mark as featured (shown prominently on homepage)</span>
                  </label>
                </div>
              </div>

              {/* Amenities */}
              <div style={S.formSection}>
                <h3 style={S.sectionTitle}>✨ Amenities</h3>
                <div style={S.amenitiesGrid}>
                  {AMENITY_OPTIONS.map((a) => (
                    <label key={a} style={{ ...S.amenityChip, ...(form.amenities.includes(a) ? S.amenityChipActive : {}) }}>
                      <input type="checkbox" checked={form.amenities.includes(a)} onChange={() => toggleAmenity(a)} style={{ display: 'none' }} />
                      {a}
                    </label>
                  ))}
                </div>
              </div>

              {/* Images */}
              <div style={S.formSection}>
                <h3 style={S.sectionTitle}>📸 Property Images</h3>

                {/* Existing images in edit mode */}
                {existingImages.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <p style={{ fontSize: 13, color: '#718096', marginBottom: 10 }}>Current images (click × to remove):</p>
                    <div style={S.previewGrid}>
                      {existingImages.map((img) => (
                        <div key={img.public_id} style={S.previewWrap}>
                          <img src={img.url} alt="" style={S.preview} />
                          <button type="button" onClick={() => removeExistingImage(img.public_id)} style={S.removeBtn}>×</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New image previews */}
                {imagePreviews.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <p style={{ fontSize: 13, color: '#718096', marginBottom: 10 }}>New images to upload:</p>
                    <div style={S.previewGrid}>
                      {imagePreviews.map((src, i) => (
                        <div key={i} style={S.previewWrap}>
                          <img src={src} alt="" style={S.preview} />
                          <button type="button" onClick={() => removeNewImage(i)} style={S.removeBtn}>×</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={S.uploadZone} onClick={() => fileRef.current?.click()}>
                  <input ref={fileRef} type="file" multiple accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                  <span style={{ fontSize: 36 }}>📁</span>
                  <p style={{ marginTop: 8, fontWeight: 500 }}>Click to upload images</p>
                  <p style={{ fontSize: 13, color: '#718096' }}>JPG, PNG, WEBP · Max 10MB each · Up to 10 images</p>
                </div>
              </div>

              {/* Submit */}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => { resetForm(); setTab('properties'); }} style={S.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} style={S.submitBtn}>
                  {submitting ? '⏳ Saving...' : tab === 'edit' ? '✅ Update Property' : '🚀 Add Property'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* ── Delete Confirm Modal ─────────────────────────────── */}
      {deleteId && (
        <div style={S.modalOverlay} onClick={() => setDeleteId(null)}>
          <div style={S.modal} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 48, textAlign: 'center' }}>🗑️</div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", textAlign: 'center', marginTop: 12, fontSize: 22 }}>Delete Property?</h3>
            <p style={{ color: '#718096', textAlign: 'center', marginTop: 8, fontSize: 14 }}>
              This will permanently delete the property and all its images. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button onClick={() => setDeleteId(null)} style={{ ...S.cancelBtn, flex: 1 }}>Cancel</button>
              <button onClick={() => handleDelete(deleteId)} style={{ ...S.deleteConfirmBtn, flex: 1 }}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Styles ──────────────────────────────────────────────────────
const S = {
  page: { display: 'flex', minHeight: '100vh', background: '#F0EDE8' },

  sidebar: {
    width: 240, minHeight: '100vh', background: 'linear-gradient(180deg, #0D1B2A 0%, #1A2E42 100%)',
    display: 'flex', flexDirection: 'column', padding: '24px 0', flexShrink: 0, position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
  },
  sidebarLogo: { display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' },
  sidebarBrand: { fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: '#E8C97A' },
  sidebarSub: { fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 1 },
  nav: { flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 },
  navBtn: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 10,
    border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: '0.2s', textAlign: 'left',
  },
  navBtnActive: { background: 'rgba(201,168,76,0.15)', color: '#E8C97A', fontWeight: 600 },
  sidebarFooter: { padding: '16px 16px 0', borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 'auto' },
  adminInfo: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 },
  adminAvatar: {
    width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #C9A84C, #A07830)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700,
  },
  logoutBtn: {
    width: '100%', padding: '10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
    background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: 13, cursor: 'pointer', marginBottom: 8,
  },
  viewSiteBtn: {
    display: 'block', textAlign: 'center', padding: '10px', borderRadius: 8,
    background: 'rgba(201,168,76,0.15)', color: '#E8C97A', fontSize: 13, fontWeight: 600,
  },

  main: { flex: 1, padding: '32px', overflowY: 'auto', maxWidth: 'calc(100vw - 240px)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  pageTitle: { fontFamily: "'Playfair Display', serif", fontSize: 28, color: '#0D1B2A' },
  pageSubtitle: { color: '#718096', fontSize: 14, marginTop: 4 },

  statsBar: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 },
  statCard: {
    background: '#fff', borderRadius: 14, padding: '20px', textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)',
  },
  statIcon: { fontSize: 24 },
  statNum: { fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#0D1B2A', marginTop: 4 },
  statLabel: { fontSize: 12, color: '#718096', fontWeight: 500, marginTop: 2 },

  content: { background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },

  propertyGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 },

  propCard: { borderRadius: 14, overflow: 'hidden', border: '1px solid #EDE5D8', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', transition: '0.2s' },
  propImgWrap: { position: 'relative', height: 180, overflow: 'hidden' },
  propImg: { width: '100%', height: '100%', objectFit: 'cover' },
  propImgPlaceholder: { width: '100%', height: '100%', background: '#F0EDE8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 },
  propBadge: { position: 'absolute', top: 10, left: 10, padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, letterSpacing: 0.5 },
  badgeSale: { background: 'rgba(201,168,76,0.9)', color: '#fff' },
  badgeRent: { background: 'rgba(46,204,113,0.9)', color: '#fff' },
  badgeSold: { background: 'rgba(231,76,60,0.9)', color: '#fff' },
  featuredBadge: { position: 'absolute', top: 10, right: 10, background: 'rgba(13,27,42,0.85)', color: '#E8C97A', padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700 },

  propBody: { padding: '16px 16px 12px' },
  propType: { fontSize: 11, fontWeight: 700, color: '#C9A84C', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6 },
  propTitle: { fontSize: 16, fontWeight: 700, color: '#0D1B2A', marginBottom: 4, fontFamily: "'Playfair Display', serif" },
  propLocation: { fontSize: 13, color: '#718096', marginBottom: 8 },
  propPrice: { fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#0D1B2A', marginBottom: 8 },
  propMeta: { display: 'flex', gap: 12, fontSize: 12, color: '#718096', flexWrap: 'wrap' },

  propActions: { display: 'flex', gap: 8, padding: '12px 16px', borderTop: '1px solid #F0EDE8' },
  editBtn: { flex: 1, padding: '9px', borderRadius: 8, background: '#F0EDE8', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#0D1B2A' },
  deleteBtn: { flex: 1, padding: '9px', borderRadius: 8, background: 'rgba(231,76,60,0.08)', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#C0392B' },

  empty: { textAlign: 'center', padding: '80px 0' },

  // Form
  form: { display: 'flex', flexDirection: 'column', gap: 24 },
  formSection: { background: '#FAFAF8', borderRadius: 14, padding: 24, border: '1px solid #EDE5D8' },
  sectionTitle: { fontSize: 16, fontWeight: 700, color: '#0D1B2A', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 },
  formGrid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 },
  formGrid3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: '#4A5568' },
  input: {
    padding: '11px 14px', border: '2px solid #E2D5C3', borderRadius: 10,
    fontSize: 14, color: '#1A1A2E', background: '#fff', transition: 'border-color 0.2s',
  },
  amenitiesGrid: { display: 'flex', flexWrap: 'wrap', gap: 10 },
  amenityChip: {
    padding: '8px 16px', borderRadius: 100, border: '2px solid #E2D5C3',
    fontSize: 13, fontWeight: 500, color: '#4A5568', cursor: 'pointer', transition: '0.2s', background: '#fff',
  },
  amenityChipActive: { background: '#C9A84C', borderColor: '#C9A84C', color: '#fff', fontWeight: 600 },
  previewGrid: { display: 'flex', flexWrap: 'wrap', gap: 12 },
  previewWrap: { position: 'relative', width: 100, height: 100, borderRadius: 10, overflow: 'hidden' },
  preview: { width: '100%', height: '100%', objectFit: 'cover' },
  removeBtn: {
    position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%',
    background: 'rgba(231,76,60,0.9)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  uploadZone: {
    border: '2px dashed #C9A84C', borderRadius: 12, padding: '32px', textAlign: 'center',
    cursor: 'pointer', background: 'rgba(201,168,76,0.04)', marginTop: 8,
  },
  cancelBtn: {
    padding: '12px 24px', borderRadius: 10, border: '2px solid #E2D5C3',
    background: '#fff', color: '#4A5568', fontSize: 14, fontWeight: 600, cursor: 'pointer',
  },
  submitBtn: {
    padding: '12px 32px', borderRadius: 10, border: 'none',
    background: 'linear-gradient(135deg, #C9A84C, #A07830)', color: '#fff',
    fontSize: 14, fontWeight: 700, cursor: 'pointer', letterSpacing: 0.3,
  },
  deleteConfirmBtn: {
    padding: '12px 24px', borderRadius: 10, border: 'none',
    background: '#E74C3C', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
  },

  // Modal
  modalOverlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24,
  },
  modal: {
    background: '#fff', borderRadius: 20, padding: 36,
    maxWidth: 420, width: '100%', boxShadow: '0 40px 80px rgba(0,0,0,0.25)',
  },
};