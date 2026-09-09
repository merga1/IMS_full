import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/i18n/LanguageContext";
import { Eye, EyeOff, Mail, Lock, Globe, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logoImage from "@assets/Logo_1762955251405.png";
import fingerImage from "@assets/finger.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { t, language, changeLanguage } = useLanguage();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);

    try {
      const response = await login(email.trim(), password.trim());
      toast({
        variant: "success",
        title: t("Login Successful"),
        description: t("Welcome back!"),
      });

      // Redirect based on user role
      const storedUser = localStorage.getItem('auth_user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.role === 'Administrator') {
          setLocation("/admin");
        } else {
          setLocation("/");
        }
      } else {
        setLocation("/");
      }
    } catch (error) {
      console.error("Login failed:", error);
      toast({
        title: t("Error"),
        description: t(
          error.response?.data?.message || (error.message === "Network Error" ? "Cannot connect to server" : error.message) || "Invalid credentials"
        ),
        variant: "error",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const languageLabels = {
    en: "English",
    am: "ET አማርኛ",
    om: "Afaan Oromoo",
    ti: "Tigrigna",
    sd: "Sidama",
    so: "Soomaali"
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 animate-moving-background"
      style={{
        backgroundImage: `url(${fingerImage}), linear-gradient(to bottom right, #0f766e, #1e3a8a)`,
        backgroundBlendMode: "overlay",
        backgroundSize: "300px, cover",
        backgroundRepeat: "repeat, no-repeat",
      }}
    >
      <div
        className="
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
              <img
                src={logoImage}
                alt={t("A-MESOB Logo")}
                className="w-24 h-24 md:w-32 md:h-32 object-contain relative z-10 drop-shadow-2xl"
              />
            </div>

            <h1 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight">
              {t("A-MESOB")}
            </h1>

            <p className="text-sm md:text-lg text-blue-100 font-light leading-relaxed">
              {t("Modern Ethiopia Service for Organized Benefit")}
            </p>
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
                <DropdownMenuItem onClick={() => changeLanguage("en")}>
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage("am")}>
                  ET አማርኛ
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage("om")}>
                  Afaan Oromoo
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage("ti")}>
                  Tigrigna
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage("sd")}>
                  Sidama
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage("so")}>
                  Soomaali
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* FORM BLOCK */}
          <div className="w-full max-w-[320px] md:max-w-[350px] space-y-5 md:space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-lg md:text-xl font-semibold text-white tracking-tight">
                {t("A-MESOB")}
              </h2>
              <p className="text-slate-400 text-[11px] md:text-xs">
                {t("Inventory Management System")}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">

              {/* EMAIL */}
              <div className="space-y-1">
                <Label className="text-slate-300 text-xs font-medium">
                  {t("Email")} <span className="text-red-400">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    type="email"
                    placeholder={t("Enter your email")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="
                      h-10 bg-[#1e293b] border-slate-700 text-white 
                      pl-10 text-sm w-full
                    "
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div className="space-y-1">
                <Label className="text-slate-300 text-xs font-medium">
                  {t("Password")} <span className="text-red-400">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder={t("Enter your password")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="
                      h-10 bg-[#1e293b] border-slate-700 text-white 
                      pl-10 pr-9 text-sm w-full
                    "
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
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
                {loading ? t("Signing In...") : t("Login")}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div >
  );
}
