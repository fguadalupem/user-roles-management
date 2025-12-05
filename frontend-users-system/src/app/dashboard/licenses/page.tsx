'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';

export default function LicensesPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [licenses, setLicenses] = useState<any[]>([]);
  const [form, setForm] = useState({
    companyName: '',
    maxUsers: 0,
    expirationDate: '',
    features: '',
  });
  const [selected, setSelected] = useState<any | null>(null);

  const isSuperAdmin = user?.roles?.includes('superadmin') || user?.roles?.includes('Administrator');

  useEffect(() => {
    if (!isSuperAdmin) return;
    load();
  }, [isSuperAdmin]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.getLicenses();
      setLicenses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.companyName || !form.expirationDate) return alert('Completa los campos');
    const payload = {
      companyName: form.companyName,
      maxUsers: Number(form.maxUsers),
      expirationDate: new Date(form.expirationDate).toISOString(),
      features: form.features ? form.features.split(',').map(s => s.trim()) : [],
    };
    await api.createLicense(payload);
    await load();
    setForm({ companyName: '', maxUsers: 0, expirationDate: '', features: '' });
    alert('Licencia creada');
  };

  const handleActivate = async (key: string) => {
    await api.activateLicense(key);
    await load();
    alert('Licencia activada');
  };

  const handleRevoke = async (id: number) => {
    await api.revokeLicense(id);
    await load();
    alert('Licencia revocada');
  };

  if (!isSuperAdmin) return <div className="p-6">No autorizado</div>;
  if (loading) return <div className="p-6">Cargando...</div>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Gestión de Licencias</h2>

      <div className="mb-6 grid grid-cols-1 gap-4 max-w-2xl">
        <input placeholder="Empresa" value={form.companyName} onChange={(e)=>setForm({...form, companyName:e.target.value})} className="input" />
        <input type="date" placeholder="Fecha expiración" value={form.expirationDate} onChange={(e)=>setForm({...form, expirationDate:e.target.value})} className="input" />
        <input type="number" placeholder="Max usuarios" value={String(form.maxUsers)} onChange={(e)=>setForm({...form, maxUsers: Number(e.target.value)})} className="input" />
        <input placeholder="features (comma separated)" value={form.features} onChange={(e)=>setForm({...form, features:e.target.value})} className="input" />
        <div>
          <button onClick={handleCreate} className="bg-[#005EB8] text-white px-4 py-2 rounded">Crear Licencia</button>
        </div>
      </div>

      <h3 className="text-lg font-medium mb-2">Licencias existentes</h3>
      <div className="space-y-3">
        {licenses.map((lic:any) => (
          <div key={lic.id} className="p-4 border rounded flex items-center justify-between">
            <div>
              <div className="font-semibold">{lic.companyName} — {lic.key}</div>
              <div className="text-sm text-gray-600">Expira: {new Date(lic.expirationDate).toLocaleString()}</div>
              <div className="text-sm text-gray-600">Activa: {lic.isActive ? 'Sí' : 'No'}</div>
            </div>
            <div className="space-x-2">
              {!lic.isActive && <button onClick={()=>handleActivate(lic.key)} className="px-3 py-1 bg-green-600 text-white rounded">Activar</button>}
              {lic.isActive && <button onClick={()=>handleRevoke(lic.id)} className="px-3 py-1 bg-red-600 text-white rounded">Revocar</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
