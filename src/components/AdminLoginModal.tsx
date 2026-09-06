import React, { useState } from 'react';
import { X, Lock, User, KeyRound, ShieldAlert, CheckCircle, ArrowRight } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (username: string, password: string) => Promise<void>;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    void (async () => {
      try {
        await onLoginSuccess(username.trim(), password);
        onClose();
        setUsername('');
        setPassword('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Usuario o contraseña incorrectos. Por favor intenta de nuevo.');
      } finally {
        setIsSubmitting(false);
      }
    })();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-[#F9F7F2] border border-[#E6E2D9] text-[#4A453E] rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 bg-white border-b border-[#E6E2D9] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#4A453E] text-[#F9F7F2] flex items-center justify-center shadow-xs">
              <Lock className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-medium text-[#4A453E]">Panel de Administración</h3>
              <p className="text-xs text-[#8C8479]">Garzon Joyería Fina • Acceso Restringido</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#8C8479] hover:text-[#4A453E] hover:bg-[#EAE7E0] rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs text-rose-800">
              <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B6459] mb-1.5">
                Usuario de Administrador
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#8C8479] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ej: admin"
                  className="w-full bg-white border border-[#E6E2D9] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#4A453E] placeholder-[#8C8479] focus:outline-none focus:border-[#4A453E] transition-colors"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B6459] mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#8C8479] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-[#E6E2D9] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#4A453E] placeholder-[#8C8479] focus:outline-none focus:border-[#4A453E] transition-colors"
                />
              </div>
            </div>

            <div className="p-3 bg-[#EAE7E0] border border-[#D9D5CD] rounded-2xl text-[11px] text-[#6B6459] space-y-1">
              <p className="font-semibold text-[#4A453E]">Acceso con tu usuario de la API</p>
              <p>Usa el usuario administrador de Garzon Joyería para obtener un token y gestionar catálogo, categorías e imágenes.</p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#4A453E] hover:bg-[#36322D] text-[#F9F7F2] font-semibold text-xs uppercase tracking-widest rounded-full transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Verificando...</span>
                ) : (
                  <>
                    <span>Iniciar Sesión como Admin</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};
