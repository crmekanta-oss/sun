import { supabase, hasSupabaseEnabled } from '../lib/supabase';
import { SEED_USERS } from '../constants.js';

const MOCK_DB_KEY = 'ekanta_mock_db';

const DEFAULT_MOCK_DB = {
  funnels: [
    {
      id: 1,
      name: 'Rajesh Kumar',
      phone: '9876543210',
      email: 'rajesh.kumar@example.com',
      city_region: 'Bengaluru',
      enquiry_type: 'New Customer',
      funnel_type: 'High Value',
      lead_source: 'WhatsApp',
      next_follow_up: '2026-06-01',
      products: ['Laptop', 'Mobile'],
      remarks: 'Interested in premium bundle',
      delivery_details: 'Installations on site',
      payment_terms: '50% advance',
      assigned_to: 'Vinodhini',
      order_number: 'A-101',
      quote_qty: 2,
      quote_amount: 158000,
      quote_desc: 'Laptop + Mobile',
      status: 'Pending',
      lost_drop_reason: null,
      won_proof_url: '',
      is_existing: false,
      created_at: '2026-05-20T09:15:00.000Z',
      created_by: 'Admin',
    },
    {
      id: 2,
      name: 'Meena Sharma',
      phone: '9123456780',
      email: 'meena.sharma@example.com',
      city_region: 'Mumbai',
      enquiry_type: 'Repeat Customer',
      funnel_type: 'Normal',
      lead_source: 'Email',
      next_follow_up: '2026-05-28',
      products: ['Desktop'],
      remarks: 'Looking for a faster delivery',
      delivery_details: 'Courier preferred',
      payment_terms: 'Net 30',
      assigned_to: 'Arjun Kumar',
      order_number: 'B-207',
      quote_qty: 1,
      quote_amount: 85000,
      quote_desc: 'High-performance desktop',
      status: 'Won',
      lost_drop_reason: null,
      won_proof_url: '',
      is_existing: false,
      created_at: '2026-05-18T14:22:00.000Z',
      created_by: 'Vinodhini',
    },
    {
      id: 3,
      name: 'Aditi Rao',
      phone: '9988776655',
      email: 'aditi.rao@example.com',
      city_region: 'Delhi',
      enquiry_type: 'Bulk Order',
      funnel_type: 'Bulk',
      lead_source: 'Call',
      next_follow_up: '2026-06-05',
      products: ['Mobile', 'Desktop'],
      remarks: 'Price sensitive, needs quote comparison',
      delivery_details: 'Warehouse pickup',
      payment_terms: '70% advance',
      assigned_to: 'Vinodhini',
      order_number: 'C-332',
      quote_qty: 15,
      quote_amount: 735000,
      quote_desc: 'Mobile and desktop mix',
      status: 'Lost',
      lost_drop_reason: 'Budget not approved',
      won_proof_url: '',
      is_existing: false,
      created_at: '2026-05-14T11:08:00.000Z',
      created_by: 'Admin',
    },
    {
      id: 4,
      name: 'Sandeep Patel',
      phone: '9654321087',
      email: 'sandeep.patel@example.com',
      city_region: 'Ahmedabad',
      enquiry_type: 'Custom Design',
      funnel_type: 'priority',
      lead_source: 'Social media',
      next_follow_up: '2026-05-30',
      products: ['Laptop'],
      remarks: 'Requires custom branding',
      delivery_details: 'Office delivery',
      payment_terms: 'Advance + balance on delivery',
      assigned_to: 'Arjun Kumar',
      order_number: 'D-420',
      quote_qty: 3,
      quote_amount: 210000,
      quote_desc: 'Branded laptops',
      status: 'Pending',
      lost_drop_reason: null,
      won_proof_url: '',
      is_existing: false,
      created_at: '2026-05-22T16:42:00.000Z',
      created_by: 'Vinodhini',
    },
    {
      id: 5,
      name: 'Nidhi Sen',
      phone: '9812345600',
      email: 'nidhi.sen@example.com',
      city_region: 'Kolkata',
      enquiry_type: 'Others',
      funnel_type: 'Others',
      lead_source: 'Website',
      next_follow_up: '2026-06-03',
      products: ['Desktop'],
      remarks: 'Looking for demo appointment',
      delivery_details: 'Showroom visit',
      payment_terms: 'Cash on delivery',
      assigned_to: 'Vinodhini',
      order_number: 'E-501',
      quote_qty: 1,
      quote_amount: 78000,
      quote_desc: 'Desktop with monitor',
      status: 'Drop',
      lost_drop_reason: 'Not ready to purchase',
      won_proof_url: '',
      is_existing: false,
      created_at: '2026-05-10T09:30:00.000Z',
      created_by: 'Admin',
    },
  ],
  users: SEED_USERS.map((u, idx) => ({
    id: u.id,
    name: u.name,
    role: u.role,
    username: u.username,
    password: u.password,
  })),
  audit_comments: [
    { id: 1, funnel_id: 1, author: 'Admin', role: 'CEO', text: 'Initial call completed. Budget approval pending.', created_at: '2026-05-21T10:24:00.000Z' },
    { id: 2, funnel_id: 2, author: 'Vinodhini', role: 'CRE', text: 'Demo scheduled for next week.', created_at: '2026-05-18T16:00:00.000Z' },
  ],
  followup_logs: [
    { id: 1, funnel_id: 1, logged_by: 'Vinodhini', logged_at: '2026-05-21T10:24:00.000Z', follow_up_date: '2026-06-01', customer_response: 'Needs pricing details', outcome: 'Callback Requested', next_follow_up: '2026-06-01' },
    { id: 2, funnel_id: 2, logged_by: 'Arjun Kumar', logged_at: '2026-05-19T12:10:00.000Z', follow_up_date: '2026-05-28', customer_response: 'Ready for approval', outcome: 'Interested', next_follow_up: '2026-05-28' },
  ],
  nextIds: { funnels: 100, comments: 100, followups: 100, users: 100 },
};

let mockDb;

function loadMockDb() {
  if (mockDb) return mockDb;
  try {
    const raw = localStorage.getItem(MOCK_DB_KEY);
    if (raw) {
      mockDb = JSON.parse(raw);
    } else {
      mockDb = DEFAULT_MOCK_DB;
      localStorage.setItem(MOCK_DB_KEY, JSON.stringify(mockDb));
    }
  } catch (error) {
    mockDb = DEFAULT_MOCK_DB;
  }
  return mockDb;
}

function saveMockDb() {
  try {
    localStorage.setItem(MOCK_DB_KEY, JSON.stringify(mockDb));
  } catch {}
}

function ensureMockDb() {
  if (!mockDb) loadMockDb();
  return mockDb;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
// Store createdAt as ISO string internally; format only at display time
const formatDisplay = (isoStr) => {
  try {
    return new Date(isoStr).toLocaleString('en-IN', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  } catch { return isoStr || '—'; }
};

export const crmService = {

  // ─── FETCH ALL FUNNELS ────────────────────────────────────────────────────
  async getAllFunnels() {
    if (!hasSupabaseEnabled) {
      const db = ensureMockDb();
      return [...db.funnels]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .map(this.mapFromDb);
    }

    try {
      const { data, error } = await supabase
        .from('funnels')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(this.mapFromDb);
    } catch (error) {
      console.error('Error in getAllFunnels:', error.message);
      return [];
    }
  },

  // ─── SAVE FUNNEL (INSERT / UPDATE) ────────────────────────────────────────
  async saveFunnel(funnel, user) {
    const dbData = this.mapToDb(funnel);
    if (!dbData.lead_source) throw new Error('lead_source is required');
    if (!funnel.isExisting && funnel.status !== 'Won' && !dbData.next_follow_up) {
      throw new Error('next_follow_up is required');
    }
    dbData.created_by = user?.name || 'admin';

    if (!hasSupabaseEnabled) {
      const db = ensureMockDb();
      if (funnel.id) {
        const idx = db.funnels.findIndex(x => String(x.id) === String(funnel.id));
        if (idx !== -1) {
          db.funnels[idx] = { ...db.funnels[idx], ...dbData, id: db.funnels[idx].id };
          saveMockDb();
          return this.mapFromDb(db.funnels[idx]);
        }
      }
      const nextId = db.nextIds.funnels += 1;
      const created = { ...dbData, id: nextId, created_at: new Date().toISOString() };
      db.funnels.unshift(created);
      saveMockDb();
      return this.mapFromDb(created);
    }

    try {
      if (funnel.id) {
        const { data, error } = await supabase
          .from('funnels').update(dbData).eq('id', funnel.id).select();
        if (error) throw error;
        return this.mapFromDb(data[0]);
      }

      const { data, error } = await supabase
        .from('funnels').insert([dbData]).select();
      if (error) throw error;
      return this.mapFromDb(data[0]);
    } catch (error) {
      console.error('Error in saveFunnel:', error.message);
      throw error;
    }
  },

  // ─── UPDATE STATUS ────────────────────────────────────────────────────────
  async updateStatus(id, status, lostDropReason = '') {
    if (!hasSupabaseEnabled) {
      const db = ensureMockDb();
      const funnel = db.funnels.find(x => String(x.id) === String(id));
      if (funnel) {
        funnel.status = status;
        funnel.lost_drop_reason = lostDropReason || null;
        saveMockDb();
      }
      return;
    }

    try {
      const { error } = await supabase
        .from('funnels')
        .update({ status, lost_drop_reason: lostDropReason || null })
        .eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Error updating status:', error.message);
    }
  },

  // ─── DELETE FUNNEL ────────────────────────────────────────────────────────
  async deleteFunnel(id) {
    if (!hasSupabaseEnabled) {
      const db = ensureMockDb();
      db.funnels = db.funnels.filter(x => String(x.id) !== String(id));
      db.audit_comments = db.audit_comments.filter(x => String(x.funnel_id) !== String(id));
      db.followup_logs = db.followup_logs.filter(x => String(x.funnel_id) !== String(id));
      saveMockDb();
      return;
    }

    try {
      const { error } = await supabase.from('funnels').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting funnel:', error.message);
      throw error;
    }
  },

  // ─── COMMENTS ─────────────────────────────────────────────────────────────
  async getComments(funnelId) {
    if (!hasSupabaseEnabled) {
      const db = ensureMockDb();
      return db.audit_comments
        .filter(c => String(c.funnel_id) === String(funnelId))
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        .map(c => ({ text: c.text, author: c.author, role: c.role, time: formatDisplay(c.created_at) }));
    }

    try {
      const { data, error } = await supabase
        .from('audit_comments').select('*')
        .eq('funnel_id', funnelId).order('created_at', { ascending: true });
      if (error) throw error;
      return (data || []).map(c => ({
        text: c.text, author: c.author, role: c.role,
        time: formatDisplay(c.created_at),
      }));
    } catch (error) {
      console.error('Error fetching comments:', error.message);
      return [];
    }
  },

  async addComment(funnelId, comment) {
    if (!hasSupabaseEnabled) {
      const db = ensureMockDb();
      const id = db.nextIds.comments += 1;
      db.audit_comments.push({
        id, funnel_id: funnelId, author: comment.author,
        role: comment.role, text: comment.text,
        created_at: new Date().toISOString(),
      });
      saveMockDb();
      return;
    }

    try {
      const { error } = await supabase.from('audit_comments').insert([{
        funnel_id: funnelId, author: comment.author,
        role: comment.role, text: comment.text,
      }]);
      if (error) throw error;
    } catch (error) {
      console.error('Error adding comment:', error.message);
    }
  },

  // ─── FOLLOW-UP LOGS ───────────────────────────────────────────────────────
  async getFollowupLogs(funnelId) {
    if (!hasSupabaseEnabled) {
      const db = ensureMockDb();
      return db.followup_logs
        .filter(row => String(row.funnel_id) === String(funnelId))
        .sort((a, b) => new Date(a.logged_at) - new Date(b.logged_at))
        .map(row => ({
          id: row.id,
          loggedBy: row.logged_by,
          loggedAt: formatDisplay(row.logged_at),
          followUpDate: row.follow_up_date,
          customerResponse: row.customer_response,
          outcome: row.outcome,
          nextFollowUp: row.next_follow_up,
        }));
    }

    try {
      const { data, error } = await supabase
        .from('followup_logs').select('*')
        .eq('funnel_id', funnelId).order('logged_at', { ascending: true });
      if (error) throw error;
      return (data || []).map(row => ({
        id:               row.id,
        loggedBy:         row.logged_by,
        loggedAt:         formatDisplay(row.logged_at),
        followUpDate:     row.follow_up_date,
        customerResponse: row.customer_response,
        outcome:          row.outcome,
        nextFollowUp:     row.next_follow_up,
      }));
    } catch (error) {
      console.error('Error fetching followup logs:', error.message);
      return [];
    }
  },

  async addFollowupLog(funnelId, log) {
    if (!hasSupabaseEnabled) {
      const db = ensureMockDb();
      const id = db.nextIds.followups += 1;
      const newLog = {
        id,
        funnel_id: funnelId,
        logged_by: log.loggedBy,
        logged_at: new Date().toISOString(),
        follow_up_date: log.followUpDate || null,
        customer_response: log.customerResponse,
        outcome: log.outcome,
        next_follow_up: log.nextFollowUp || null,
      };
      db.followup_logs.push(newLog);
      saveMockDb();
      return newLog;
    }

    try {
      const { data, error } = await supabase
        .from('followup_logs')
        .insert({
          funnel_id:         funnelId,
          logged_by:         log.loggedBy,
          follow_up_date:    log.followUpDate || null,
          customer_response: log.customerResponse,
          outcome:           log.outcome,
          next_follow_up:    log.nextFollowUp || null,
        })
        .select().single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding followup log:', error.message);
      throw error;
    }
  },

  async updateNextFollowup(funnelId, date) {
    if (!hasSupabaseEnabled) {
      const db = ensureMockDb();
      const funnel = db.funnels.find(x => String(x.id) === String(funnelId));
      if (funnel) {
        funnel.next_follow_up = date || null;
        saveMockDb();
      }
      return;
    }

    try {
      const { error } = await supabase
        .from('funnels').update({ next_follow_up: date || null }).eq('id', funnelId);
      if (error) throw error;
    } catch (error) {
      console.error('Error updating next followup:', error.message);
      throw error;
    }
  },

  // ─── USERS ────────────────────────────────────────────────────────────────
  async getUsers() {
    if (!hasSupabaseEnabled) {
      const db = ensureMockDb();
      return [...db.users];
    }

    try {
      const { data, error } = await supabase.from('users').select('*');
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching users:', error.message);
      return [];
    }
  },

  async saveUsers(users) {
    if (!hasSupabaseEnabled) {
      const db = ensureMockDb();
      for (const user of users) {
        const existing = db.users.find(u => u.username === user.username);
        if (existing) {
          Object.assign(existing, user);
        } else {
          db.users.push({ ...user, id: db.nextIds.users += 1 });
        }
      }
      saveMockDb();
      return;
    }

    try {
      for (const user of users) {
        const { id, ...rest } = user;
        const isUuid = typeof id === 'string' && id.length > 20;
        const payload = isUuid ? { id, ...rest } : rest;
        const { error } = await supabase
          .from('users').upsert(payload, { onConflict: 'username' });
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error saving users:', error.message);
      throw error;
    }
  },

  async deleteUser(username) {
    if (!hasSupabaseEnabled) {
      const db = ensureMockDb();
      db.users = db.users.filter(u => u.username !== username);
      saveMockDb();
      return;
    }

    try {
      const { error } = await supabase.from('users').delete().eq('username', username);
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting user:', error.message);
    }
  },

  // ─── WON PROOF ────────────────────────────────────────────────────────────
  async updateWonProof(id, url) {
    if (!hasSupabaseEnabled) {
      const db = ensureMockDb();
      const funnel = db.funnels.find(x => String(x.id) === String(id));
      if (funnel) {
        funnel.won_proof_url = url || null;
        saveMockDb();
      }
      return;
    }

    try {
      const { error } = await supabase
        .from('funnels').update({ won_proof_url: url || null }).eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Error updating won proof:', error.message);
      throw error;
    }
  },

  // ─── MAP TO DB (camelCase → snake_case) ──────────────────────────────────
  mapToDb(f) {
    const isNum = v => v !== '' && v !== null && v !== undefined;
    return {
      name:             f.name,
      phone:            f.phone            || null,
      email:            f.email            || null,
      city_region:      f.cityRegion       || null,
      enquiry_type:     f.enquiryType      || null,
      funnel_type:      f.funnelType       || null,
      lead_source:      f.leadSource,
      next_follow_up:   f.nextFollowUp     || null,
      products:         f.products         || [],
      remarks:          f.remarks          || null,
      delivery_details: f.deliveryDetails  || null,
      payment_terms:    f.paymentTerms     || null,
      assigned_to:      f.assignedTo       || null,
      order_number:     f.orderNumber      || null,
      quote_qty:        isNum(f.quoteQty)    ? Number(f.quoteQty)    : null,
      quote_amount:     isNum(f.quoteAmount) ? Number(f.quoteAmount) : null,
      quote_desc:       f.quoteDesc        || null,
      status:           f.status           || 'Pending',
      lost_drop_reason: f.lostDropReason   || null,
      won_proof_url:    f.wonProofUrl      || null,
      is_existing:      f.isExisting       || false,
    };
  },

  // ─── MAP FROM DB (snake_case → camelCase) ────────────────────────────────
  // IMPORTANT: createdAt is kept as ISO string for reliable date math.
  // Format it at display time using formatDisplay() or toLocaleDateString().
  mapFromDb(f) {
    if (!f) return null;
    return {
      id:              f.id,
      name:            f.name,
      phone:           f.phone,
      email:           f.email,
      cityRegion:      f.city_region,
      enquiryType:     f.enquiry_type,
      funnelType:      f.funnel_type,
      leadSource:      f.lead_source,
      nextFollowUp:    f.next_follow_up,
      products:        f.products     || [],
      remarks:         f.remarks,
      deliveryDetails: f.delivery_details,
      paymentTerms:    f.payment_terms,
      orderNumber:     f.order_number,
      quoteQty:        f.quote_qty,
      quoteAmount:     f.quote_amount,
      quoteDesc:       f.quote_desc,
      status:          f.status,
      // ← ISO string preserved for date math; display with formatDisplay()
      createdAt:       f.created_at,
      createdBy:       f.created_by,
      assignedTo:      f.assigned_to  || null,
      lostDropReason:  f.lost_drop_reason || '',
      wonProofUrl:     f.won_proof_url    || '',
      isExisting:      f.is_existing      || false,
    };
  },

  // ─── BULK UPDATE ─────────────────────────────────────────────────────────────
  async bulkUpdate(ids, fields) {
    if (!ids || ids.length === 0) return;
    if (!hasSupabaseEnabled) {
      const db = ensureMockDb();
      for (const id of ids) {
        const funnel = db.funnels.find(x => String(x.id) === String(id));
        if (!funnel) continue;
        if (fields.status !== undefined) funnel.status = fields.status;
        if (fields.assignedTo !== undefined) funnel.assigned_to = fields.assignedTo || null;
        if (fields.nextFollowUp !== undefined) funnel.next_follow_up = fields.nextFollowUp || null;
        if (fields.funnelType !== undefined) funnel.funnel_type = fields.funnelType || null;
        if (fields.leadSource !== undefined) funnel.lead_source = fields.leadSource;
        if (fields.lostDropReason !== undefined) funnel.lost_drop_reason = fields.lostDropReason || null;
      }
      saveMockDb();
      return;
    }

    try {
      const updates = {};
      if (fields.status        !== undefined) updates.status           = fields.status;
      if (fields.assignedTo    !== undefined) updates.assigned_to      = fields.assignedTo || null;
      if (fields.nextFollowUp  !== undefined) updates.next_follow_up   = fields.nextFollowUp || null;
      if (fields.funnelType    !== undefined) updates.funnel_type      = fields.funnelType || null;
      if (fields.leadSource    !== undefined) updates.lead_source      = fields.leadSource;
      if (fields.lostDropReason!== undefined) updates.lost_drop_reason = fields.lostDropReason || null;
      if (Object.keys(updates).length === 0) return;
      const { error } = await supabase
        .from('funnels')
        .update(updates)
        .in('id', ids);
      if (error) throw error;
    } catch (error) {
      console.error('Error in bulkUpdate:', error.message);
      throw error;
    }
  },

  // ─── UPLOAD FILE (Base64 → Supabase Storage) ─────────────────────────────────
  async uploadProofImage(funnelId, file) {
    if (!hasSupabaseEnabled) {
      try {
        return URL.createObjectURL(file);
      } catch (error) {
        console.error('Offline upload error:', error.message);
        return '';
      }
    }

    try {
      const ext  = file.name.split('.').pop() || 'jpg';
      const path = `proofs/${funnelId}_${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage
        .from('ekanta-proofs')
        .upload(path, file, { upsert: true, contentType: file.type });
      if (error) throw error;
      const { data: urlData } = supabase.storage
        .from('ekanta-proofs')
        .getPublicUrl(path);
      return urlData.publicUrl;
    } catch (error) {
      console.error('Upload error:', error.message);
      throw error;
    }
  }
};
