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

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.021,35.596,44,30.038,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
  </svg>
);

// --- LOGIN/REGISTER SCREEN COMPONENT ---
const LoginScreen = ({ onRegister, onLogin, onGoogleSignIn, initialName, isLoading, error }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [formData, setFormData] = useState({
    name: initialName || '',
    password: '',
    email: '',
    birthDate: '',
    educationLevel: 'ensino-medio'
  });

  useEffect(() => {
    if (initialName) setFormData(prev => ({ ...prev, name: initialName }));
  }, [initialName]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isRegisterFormValid = () => {
    return (
      formData.name.trim() !== '' &&
      formData.password.trim().length >= 6 &&
      formData.email.includes('@') &&
      formData.email.includes('.') &&
      formData.birthDate !== ''
    );
  };

  const isLoginFormValid = () => {
    return formData.email.includes('@') && formData.password.trim() !== '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoginView) {
      if (isLoginFormValid()) {
        onLogin({ email: formData.email, password: formData.password });
      }
    } else {
      if (isRegisterFormValid()) {
        onRegister(formData);
      }
    }
  };

  const toggleView = () => {
    setIsLoginView(!isLoginView);
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
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{isLoginView ? 'Bem-vindo de volta!' : 'Criar Conta'}</h1>
            <p className="text-slate-500 text-xs font-medium mt-1">{isLoginView ? 'Acesse sua conta para continuar' : 'Comece sua jornada de Deep Work'}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLoginView && (
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
                  required={!isLoginView}
                />
              </div>
            )}

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
                required
              />
            </div>

            {/* Password */}
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
                required
              />
            </div>

            {!isLoginView && (
              <>
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
                    required={!isLoginView}
                  />
                </div>

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
              </>
            )}

            {error && <p className="text-xs text-red-500 font-bold text-center pt-2">{error}</p>}

            <button
              type="submit"
              disabled={isLoading || (isLoginView ? !isLoginFormValid() : !isRegisterFormValid())}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:shadow-2xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group mt-6"
            >
              {isLoading ? (
                <span className="animate-pulse">{isLoginView ? 'Entrando...' : 'Criando Perfil...'}</span>
              ) : (
                <>
                  {isLoginView ? 'Entrar' : 'Finalizar Cadastro'} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <div className="flex items-center gap-3 py-2">
              <div className="flex-grow h-px bg-slate-200"></div>
              <span className="text-xs font-bold text-slate-400">ou</span>
              <div className="flex-grow h-px bg-slate-200"></div>
            </div>

            <button
              type="button"
              onClick={onGoogleSignIn}
              disabled={isLoading}
              className="w-full bg-white text-slate-700 py-3 rounded-xl font-bold text-base shadow-md border border-slate-200 hover:bg-slate-50 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
            >
              <GoogleIcon /> Entrar com Google
            </button>
          </form>
        </div>

        <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
          <button onClick={toggleView} className="text-xs text-indigo-600 font-bold hover:underline">
            {isLoginView ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;