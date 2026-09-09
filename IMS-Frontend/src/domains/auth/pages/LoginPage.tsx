import { useState } from "react";
import { useAuthStore } from "@/state/auth.store";
import { useLocation } from "wouter";
import { useLanguage } from "@/app/providers/LanguageProvider";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Eye, EyeOff, Mail, Lock, Globe, ChevronDown, Loader2, UserCheck, CreditCard } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { toast } from "@/shared/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";


export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login, loginWithEmail, users } = useAuthStore();
  const { t, language, setLanguage } = useLanguage();
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginMode, setLoginMode] = useState<'email' | 'fayda'>('email');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);

    try {
      if (loginMode === 'fayda') {
        await login(credential.trim(), password.trim());
      } else {
        await loginWithEmail(credential.trim(), password.trim());
      }

      toast({
        title: t('auth.login_success'),
        description: t('auth.welcome_back')
      });

      const user = useAuthStore.getState().user;
      if (user?.role === 'SYSTEM_ADMIN') {
        setLocation("/admin");
      } else {
        setLocation("/");
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      toast({
        title: t('auth.login_failed'),
        description: error.message || t('auth.invalid_credentials'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };


  const languageLabels: Record<string, string> = {
    EN: "English",
    AM: "ET አማርኛ",
    OM: "Afaan Oromoo",
    TI: "Tigrigna",
    SO: "Soomaali",
    AA: "Afar"
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: "linear-gradient(to bottom right, #0f766e, #1e3a8a)",
        backgroundSize: "cover",
      }}
    >
      <div
        className="absolute inset-0 animate-moving-background pointer-events-none"
        style={{
          backgroundImage: `url(/finger.png)`,
          backgroundSize: "300px",
          backgroundRepeat: "repeat",
          mixBlendMode: "overlay",
        }}
      />

      <div
        className="
                    relative z-10
                    w-full max-w-5xl 
                    h-auto md:h-[600px] 
                    flex flex-col md:flex-row 
                    rounded-none overflow-hidden shadow-2xl 
                    bg-black/20 backdrop-blur-sm
                "
      >
        {/* LEFT PANEL */}
        <div
          className="
                        w-full md:w-1/2 
                        h-auto 
                        bg-[#1854C4] 
                        flex flex-col items-center justify-center 
                        p-6 md:p-8 
                        text-white relative overflow-hidden
                        text-center
                    "
        >
          <div className="relative z-10 flex flex-col items-center text-center max-w-sm md:max-w-md">
            <div className="mb-6 md:mb-8 relative">
              {/* Using the standard logo available in public folder */}
              <img
                src="/Logo.png"
                alt="A-MESOB Logo"
                className="w-24 h-24 md:w-32 md:h-32 object-contain relative z-10 drop-shadow-2xl"
              />
            </div>

            <h1 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight">
              {t('app.name')}
            </h1>

            <p className="text-lg md:text-xl text-blue-100 font-light leading-relaxed mb-6">
              {t('auth.full_name')}
              <br />
              <span className="text-xs opacity-70 mt-2 block">{t('auth.system_name')}</span>
            </p>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 text-left max-h-[300px] w-full overflow-y-auto custom-scrollbar">
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2 text-sm">
                <UserCheck className="w-4 h-4" /> {t('auth.demo_credentials')}
              </h3>
              <p className="text-[10px] text-blue-200 mb-3">{t('auth.password_label')} <strong>password</strong> {t('auth.click_to_fill')}</p>

              <div className="space-y-2">
                {users.map((u) => (
                  <div key={u.id} className="p-2 bg-black/20 rounded hover:bg-black/30 transition-colors cursor-pointer border border-transparent hover:border-white/10" onClick={() => { setCredential(u.faydaId); setLoginMode('fayda'); }}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-medium text-white">{u.fullName}</span>
                      <Badge variant="outline" className="border-blue-400/30 text-blue-200 text-[9px] h-4 px-1 py-0">
                        {u.role.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <code className="text-[10px] text-blue-300 font-mono">
                        {u.faydaId}
                      </code>
                      <span className="text-[9px] text-gray-400">{u.branch}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div
          className="
                        w-full md:w-1/2 
                        bg-[#0f172a] 
                        flex flex-col items-center 
                        justify-center 
                        p-6 md:p-8 
                        relative
                    "
        >
          {/* LANGUAGE BUTTON */}
          <div className="absolute top-4 right-4 md:top-6 md:right-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="
                                        text-white hover:bg-white/10 
                                        gap-2 border border-white/20 rounded-none 
                                        h-8 md:h-9 px-2 md:px-3 text-xs md:text-sm
                                    "
                >
                  <Globe className="w-3 h-3" />
                  <span>{languageLabels[language]}</span>
                  <ChevronDown className="w-3 h-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-36 md:w-40 bg-[#1e293b] border-slate-700 text-white text-xs md:text-sm"
              >
                {Object.entries(languageLabels).map(([key, label]) => (
                  <DropdownMenuItem key={key} onClick={() => setLanguage(key as any)} className="focus:bg-slate-700 focus:text-white cursor-pointer">
                    {label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* FORM BLOCK */}
          <div className="w-full max-w-[320px] md:max-w-[350px] space-y-5 md:space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-lg md:text-xl font-semibold text-white tracking-tight">
                {t('auth.secured_access')}
              </h2>
              <p className="text-slate-400 text-[11px] md:text-xs">
                {t('auth.enter_credentials')}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">

              {/* LOGIN MODE TOGGLE */}
              <div className="flex rounded-none border border-slate-700 overflow-hidden">
                <button
                  type="button"
                  onClick={() => { setLoginMode('email'); setCredential(''); }}
                  className={`flex-1 py-1.5 text-xs flex items-center justify-center gap-1.5 transition-colors ${
                    loginMode === 'email' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  <Mail className="w-3 h-3" /> Email
                </button>
                <button
                  type="button"
                  onClick={() => { setLoginMode('fayda'); setCredential(''); }}
                  className={`flex-1 py-1.5 text-xs flex items-center justify-center gap-1.5 transition-colors ${
                    loginMode === 'fayda' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  <CreditCard className="w-3 h-3" /> Fayda ID
                </button>
              </div>

              {/* CREDENTIAL FIELD */}
              <div className="space-y-1">
                <Label className="text-slate-300 text-xs font-medium">
                  {loginMode === 'email' ? t('auth.email') : 'Fayda ID'} <span className="text-red-400">*</span>
                </Label>
                <div className="relative">
                  {loginMode === 'email'
                    ? <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    : <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  }
                  <Input
                    type={loginMode === 'email' ? 'email' : 'text'}
                    placeholder={loginMode === 'email' ? t('auth.enter_email') : 'e.g. FIN-1000'}
                    value={credential}
                    onChange={(e) => setCredential(e.target.value)}
                    required
                    className="h-10 bg-[#1e293b] border-slate-700 text-white pl-10 text-sm w-full focus-visible:ring-blue-500"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div className="space-y-1">
                <Label className="text-slate-300 text-xs font-medium">
                  {t('auth.password')} <span className="text-red-400">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder={t('auth.enter_password')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="
                                            h-10 bg-[#1e293b] border-slate-700 text-white 
                                            pl-10 pr-9 text-sm w-full focus-visible:ring-blue-500
                                        "
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* SUBMIT */}
              <Button
                type="submit"
                disabled={loading}
                className="
                                    w-full h-10 bg-[#2563eb] hover:bg-[#1d4ed8] 
                                    text-white text-sm rounded-none 
                                    mt-1 shadow-blue-900/20
                                "
              >
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t('auth.signing_in')}</> : t('auth.login')}
              </Button>
            </form>

            <div className="mt-4 p-3 bg-slate-800/50 text-slate-400 text-xs rounded border border-slate-700/50">
              <strong>{t('auth.demo_credentials')}:</strong><br />
              Admin: admin@mesob.gov.et<br />
              Director: derartu@mesob.gov.et<br />
              Staff: bekele@mesob.gov.et
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
