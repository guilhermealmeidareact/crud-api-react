import { useState, useEffect, useCallback } from "react";
 
const API = "https://seusite.infinityfreeapp.com/api.php";
 
const IconUser  = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconEdit  = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg>;
const IconTrash = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const IconPlus  = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconCheck = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>;
const IconX     = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
 
function UserForm({ initial = {}, onSave, onCancel, loading }) {
  const [form, setForm] = useState({
    nome:  initial.nome  || "",
    email: initial.email || "",
    idade: initial.idade || "",
  });
 
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
 
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-gray-400">Nome</label>
        <input
          className="bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-blue transition-colors placeholder-zinc-500"
          value={form.nome} onChange={set("nome")} placeholder="Ex: João Silva" required
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-gray-400">Email</label>
        <input
          className="bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-blue transition-colors placeholder-zinc-500"
          type="email" value={form.email} onChange={set("email")} placeholder="Ex: joao@email.com" required
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-gray-400">Idade</label>
        <input
          className="bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-blue transition-colors placeholder-zinc-500"
          type="number" value={form.idade} onChange={set("idade")} placeholder="Ex: 25" min="1" max="120" required
        />
      </div>
      <div className="md:col-span-3 flex gap-3 mt-1">
        <button
          className="flex items-center gap-2 bg-brand-blue hover:opacity-90 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-opacity disabled:opacity-40"
          onClick={() => onSave(form)} disabled={loading}
        >
          <IconCheck /> {loading ? "Salvando…" : "Salvar"}
        </button>
        {onCancel && (
          <button
            className="flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-gray-300 text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            onClick={onCancel}
          >
            <IconX /> Cancelar
          </button>
        )}
      </div>
    </div>
  );
}
 
export default function App() {
  const [usuarios, setUsuarios]   = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [toast, setToast]         = useState(null);
 
  const showToast = (msg, tipo = "sucesso") => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3000);
  };
 
  const carregar = useCallback(async () => {
    try {
      const res  = await fetch(API);
      const data = await res.json();
      setUsuarios(data);
    } catch {
      showToast("Erro ao carregar usuários.", "erro");
    }
  }, []);
 
  useEffect(() => { carregar(); }, [carregar]);
 
  async function criar(form) {
    setLoading(true);
    try {
      await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      showToast("Usuário cadastrado com sucesso!");
      setShowForm(false);
      carregar();
    } catch { showToast("Erro ao cadastrar.", "erro"); }
    finally { setLoading(false); }
  }
 
  async function editar(form) {
    setLoading(true);
    try {
      await fetch(API, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, ...form }),
      });
      showToast("Usuário atualizado!");
      setEditingId(null);
      carregar();
    } catch { showToast("Erro ao editar.", "erro"); }
    finally { setLoading(false); }
  }
 
  async function deletar(id, nome) {
    if (!confirm(`Deletar "${nome}"? Essa ação não pode ser desfeita.`)) return;
    try {
      await fetch(`${API}?id=${id}`, { method: "DELETE" });
      showToast("Usuário deletado.");
      carregar();
    } catch { showToast("Erro ao deletar.", "erro"); }
  }
 
  const usuarioEditando = usuarios.find((u) => u.id === editingId);
 
  return (
    <div className="min-h-screen bg-brand-dark py-10 px-4">
 
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-lg
          ${toast.tipo === "erro" ? "bg-red-900 text-red-200" : "bg-brand-blue text-white"}`}>
          {toast.tipo === "erro" ? "❌" : "✅"} {toast.msg}
        </div>
      )}
 
      <div className="max-w-4xl mx-auto space-y-6">
 
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Usuários</h1>
            <p className="text-sm text-zinc-500 mt-1">
              {usuarios.length} {usuarios.length === 1 ? "registro" : "registros"}
            </p>
          </div>
          <button
            className="flex items-center gap-2 bg-brand-blue hover:opacity-90 text-white font-semibold px-4 py-2 rounded-lg transition-opacity text-sm"
            onClick={() => { setShowForm((v) => !v); setEditingId(null); }}
          >
            <IconPlus /> Novo usuário
          </button>
        </div>
 
        {/* Formulário de cadastro */}
        {showForm && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-base font-semibold text-white mb-4">Cadastrar usuário</h2>
            <UserForm onSave={criar} onCancel={() => setShowForm(false)} loading={loading} />
          </div>
        )}
 
        {/* Tabela */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          {usuarios.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-zinc-500">
              <span className="text-5xl">👤</span>
              <p>Nenhum usuário cadastrado ainda.</p>
              <button
                className="flex items-center gap-2 bg-brand-blue hover:opacity-90 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-opacity"
                onClick={() => setShowForm(true)}
              >
                <IconPlus /> Cadastrar primeiro usuário
              </button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-brand-blue text-white text-left">
                  {["#", "Nome", "Email", "Idade", "Ações"].map((h) => (
                    <th key={h} className="px-5 py-3 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <>
                    <tr key={u.id} className="border-b border-zinc-800 hover:bg-zinc-800 transition-colors">
                      <td className="px-5 py-3 text-zinc-500 font-semibold">#{u.id}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-blue/20 text-brand-blue flex items-center justify-center">
                            <IconUser />
                          </div>
                          <span className="font-medium text-white">{u.nome}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-zinc-400">{u.email}</td>
                      <td className="px-5 py-3 text-zinc-400">{u.idade} anos</td>
                      <td className="px-5 py-3">
                        <div className="flex gap-2">
                          <button
                            className="flex items-center gap-1.5 bg-zinc-700 hover:bg-zinc-600 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors"
                            onClick={() => { setEditingId(editingId === u.id ? null : u.id); setShowForm(false); }}
                          >
                            <IconEdit /> Editar
                          </button>
                          <button
                            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors"
                            onClick={() => deletar(u.id, u.nome)}
                          >
                            <IconTrash /> Deletar
                          </button>
                        </div>
                      </td>
                    </tr>
 
                    {editingId === u.id && (
                      <tr key={`edit-${u.id}`} className="bg-zinc-800/50">
                        <td colSpan={5} className="px-5 py-4">
                          <p className="text-sm font-semibold text-zinc-300 mb-3">
                            Editando #{u.id} — {u.nome}
                          </p>
                          <UserForm
                            initial={usuarioEditando}
                            onSave={editar}
                            onCancel={() => setEditingId(null)}
                            loading={loading}
                          />
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
