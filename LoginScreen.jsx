import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Calendar, 
  Lock, 
  GraduationCap, 
  ChevronRight, 
  ArrowRight, 
  Sparkles, 
  Brain 
} from 'lucide-react';

// --- LOGIN/REGISTER SCREEN COMPONENT ---
const LoginScreen = ({ onRegister, initialName, isLoading }) => {
  const [formData, setFormData] = useState({
    name: initialName || '',
    password: '',
    email: '',
    birthDate: '',
    educationLevel: 'ensino-medio' // Valor padrão
  });
  
  useEffect(() => {
    if (initialName) setFormData(prev => ({ ...prev, name: initialName }));
  }, [initialName]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isFormValid = () => {
    return (
      formData.name.trim() !== '' &&
      formData.password.trim() !== '' &&
      formData.email.includes('@') &&
      formData.email.includes('.') &&
      formData.birthDate !== ''
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFormValid()) {
      onRegister(formData);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-50 items-center justify-center font-sans p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-500 flex flex-col">
        {/* Decorativo */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500"></div>
        
        <div className="p-8 md:p-10">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-200 mb-4 transform hover:scale-110 transition-transform duration-300">
              <Brain className="text-white w-8 h-8" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Criar Conta</h1>
            <p className="text-slate-500 text-xs font-medium mt-1">Comece sua jornada de Deep Work</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Nome */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                <User size={18} />
              </div>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nome Completo"
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm font-bold focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all placeholder:font-normal"
                disabled={isLoading}
              />
            </div>

            {/* Email */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                <Mail size={18} />
              </div>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="seu.email@exemplo.com"
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm font-bold focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all placeholder:font-normal"
                disabled={isLoading}
              />
            </div>

            {/* Data de Nascimento & Senha (Grid) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                  <Calendar size={18} />
                </div>
                <input 
                  type="date" 
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  className="w-full pl-12 pr-2 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm font-bold focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all"
                  disabled={isLoading}
                />
              </div>

              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  type="password" 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Senha"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm font-bold focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all placeholder:font-normal"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Escolaridade */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                <GraduationCap size={18} />
              </div>
              <select
                name="educationLevel"
                value={formData.educationLevel}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm font-bold focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all appearance-none cursor-pointer"
                disabled={isLoading}
              >
                <option value="ensino-fundamental">Ensino Fundamental</option>
                <option value="ensino-medio">Ensino Médio</option>
                <option value="ensino-superior">Ensino Superior (Graduação)</option>
                <option value="pos-graduacao">Pós-Graduação / MBA</option>
                <option value="mestrado-doutorado">Mestrado / Doutorado</option>
                <option value="autodidata">Autodidata / Livre</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronRight size={14} className="rotate-90" />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={!isFormValid() || isLoading}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:shadow-2xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group mt-6"
            >
              {isLoading ? (
                <span className="animate-pulse">Criando Perfil...</span>
              ) : (
                <>
                  Finalizar Cadastro <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
        
        <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <Sparkles size={12} className="text-amber-400" />
            <span>Seus dados personalizam sua experiência de estudo.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;