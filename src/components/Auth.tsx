import React from "react";
// @ts-ignore
import companyLogo from "../assets/logo.png";
import { User, UserRole } from "../types";
import { Shield, Lock, Mail, UserPlus, Info, CheckCircle, ArrowLeft } from "lucide-react";

interface AuthProps {
  onLoginSuccess: (user: User) => void;
  users: User[];
}

export default function Auth({ onLoginSuccess, users }: AuthProps) {
  const [view, setView] = React.useState<"login" | "register" | "forgot" | "reset">("login");
  
  // Login fields
  const [email, setEmail] = React.useState("admin@inventra.ai");
  const [password, setPassword] = React.useState("••••••••");
  const [loginRole, setLoginRole] = React.useState<UserRole>("Admin");
  
  // Register fields
  const [regName, setRegName] = React.useState("");
  const [regEmail, setRegEmail] = React.useState("");
  const [regRole, setRegRole] = React.useState<UserRole>("Employee");
  const [regPass, setRegPass] = React.useState("");
  
  // Recovery fields
  const [recEmail, setRecEmail] = React.useState("");
  const [recSuccess, setRecSuccess] = React.useState(false);
  const [resetCode, setResetCode] = React.useState("");
  const [resetNewPass, setResetNewPass] = React.useState("");
  const [resetSuccess, setResetSuccess] = React.useState(false);

  const [errorMsg, setErrorMsg] = React.useState("");

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Look up mock user corresponding to the selected role or email address
    const target = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() || (u.role === loginRole && email.includes("@"))
    );

    if (target) {
      onLoginSuccess(target);
    } else {
      // Create a temporary session fallback if they input another email
      const matchedName = email.split("@")[0];
      const customUser: User = {
        id: "u_" + Date.now(),
        email: email,
        name: matchedName.charAt(0).toUpperCase() + matchedName.slice(1),
        role: loginRole,
        avatarUrl: `https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&auto=format&fit=crop&q=80`
      };
      onLoginSuccess(customUser);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPass) {
      setErrorMsg("Please fill in all requested fields.");
      return;
    }
    setErrorMsg("");
    
    // Auto login as register
    const newUser: User = {
      id: "u_new_" + Date.now(),
      email: regEmail,
      name: regName,
      role: regRole,
      avatarUrl: `https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&auto=format&fit=crop&q=80`
    };
    onLoginSuccess(newUser);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recEmail) {
      setErrorMsg("Please provide your email address.");
      return;
    }
    setErrorMsg("");
    setRecSuccess(true);
    setTimeout(() => {
      setView("reset");
    }, 2500);
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetCode || !resetNewPass) {
      setErrorMsg("Please complete all fields.");
      return;
    }
    setErrorMsg("");
    setResetSuccess(true);
    setTimeout(() => {
      setView("login");
      setResetSuccess(false);
      setRecSuccess(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-zinc-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background Decorative Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />
      
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center items-center gap-3">
          <img 
            src={companyLogo} 
            alt="HR Pharma Logo" 
            className="w-12 h-12 rounded-xl object-contain bg-white p-1 border border-zinc-800"
            referrerPolicy="no-referrer"
          />
          <div className="text-left">
            <h1 className="font-sans font-bold tracking-tight text-white text-xl leading-none">
              HR <span className="text-teal-400">Pharma</span>
            </h1>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-1">
              Pharmaceutical Inventory Network
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-zinc-950/80 backdrop-blur-md py-8 px-6 sm:px-10 border border-zinc-800/80 rounded-2xl shadow-2xl">
          
          {errorMsg && (
            <div className="mb-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs py-2.5 px-3 rounded-lg flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-rose-500 flex-shrink-0" />
              {errorMsg}
            </div>
          )}

          {/* LOGIN VIEW */}
          {view === "login" && (
            <div>
              <div className="mb-6 text-center">
                <h2 className="text-xl font-sans font-semibold text-white tracking-tight">
                  Welcome to Operations
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Authenticate your workspace session or select a preset role.
                </p>
              </div>

              {/* Demo Fast Login Tool */}
              <div className="mb-6 p-3 bg-zinc-900/50 rounded-xl border border-zinc-800">
                <p className="text-[10px] uppercase font-mono text-indigo-400 font-semibold mb-2 flex items-center gap-1">
                  <Info size={11} /> Sandbox Quick-Credentials
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["Admin", "Manager", "Employee"] as UserRole[]).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => {
                        setLoginRole(role);
                        const mappedEmail = `${role.toLowerCase()}@inventra.ai`;
                        setEmail(mappedEmail);
                        setPassword("••••••••");
                      }}
                      className={`py-1.5 px-2 rounded-md font-mono text-[10px] border transition-all text-center ${
                        loginRole === role
                          ? "bg-indigo-600/10 border-indigo-500 text-indigo-300 font-bold"
                          : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-300"
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs text-zinc-400 font-sans font-medium uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                      <Mail size={14} />
                    </span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-indigo-500 text-white rounded-lg text-sm pl-9 pr-3 py-2.5 transition-colors focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs text-zinc-400 font-sans font-medium uppercase tracking-wider">
                      Security Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setView("forgot")}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-sans"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                      <Lock size={14} />
                    </span>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-indigo-500 text-white rounded-lg text-sm pl-9 pr-3 py-2.5 transition-colors focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-sm font-semibold rounded-lg py-2.5 shadow-lg shadow-indigo-600/20 active:translate-y-[1px] transition-all"
                  >
                    Authenticate as {loginRole}
                  </button>
                </div>
              </form>

              <div className="mt-6 text-center border-t border-zinc-800 pt-5">
                <button
                  type="button"
                  onClick={() => setView("register")}
                  className="text-xs text-zinc-400 hover:text-white transition-colors"
                >
                  Need a secure workspace? <span className="text-indigo-400 font-medium">Request Register</span>
                </button>
              </div>
            </div>
          )}

          {/* REGISTER VIEW */}
          {view === "register" && (
            <div>
              <div className="mb-6 text-center">
                <h2 className="text-xl font-sans font-semibold text-white tracking-tight">
                  Request SaaS Registration
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Provision your own member node inside the HR Pharma network.
                </p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs text-zinc-400 font-sans font-medium uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                      <UserPlus size={14} />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-indigo-500 text-white rounded-lg text-sm pl-9 pr-3 py-2.5 transition-colors focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 font-sans font-medium uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                      <Mail size={14} />
                    </span>
                    <input
                      type="email"
                      required
                      placeholder="john@organization.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-indigo-500 text-white rounded-lg text-sm pl-9 pr-3 py-2.5 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 font-sans font-medium uppercase tracking-wider mb-1.5">
                    Target Role Access
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["Admin", "Manager", "Employee"] as UserRole[]).map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setRegRole(role)}
                        className={`py-2 px-3 rounded-md font-sans text-xs border text-center transition-all ${
                          regRole === role
                            ? "bg-indigo-600/10 border-indigo-500 text-indigo-300 font-semibold"
                            : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 font-sans font-medium uppercase tracking-wider mb-1.5">
                    Master Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                      <Lock size={14} />
                    </span>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={regPass}
                      onChange={(e) => setRegPass(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-indigo-500 text-white rounded-lg text-sm pl-9 pr-3 py-2.5 transition-colors"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-sm font-semibold rounded-lg py-2.5 hover:shadow-lg transition-all"
                  >
                    Generate Agent Workspace
                  </button>
                </div>
              </form>

              <div className="mt-6 text-center border-t border-zinc-800 pt-5">
                <button
                  type="button"
                  onClick={() => setView("login")}
                  className="text-xs text-zinc-400 hover:text-white transition-colors"
                >
                  Already authorized? <span className="text-indigo-400 font-medium">Bypass login</span>
                </button>
              </div>
            </div>
          )}

          {/* FORGOT PASSWORD VIEW */}
          {view === "forgot" && (
            <div>
              <div className="mb-6 text-center">
                <h2 className="text-xl font-sans font-semibold text-white tracking-tight">
                  Recover Credentials
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  We'll issue a secure cryptographic verification token to your register email.
                </p>
              </div>

              {recSuccess ? (
                <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4 text-center space-y-2">
                  <div className="flex justify-center text-indigo-400">
                    <CheckCircle size={32} />
                  </div>
                  <h3 className="font-semibold text-zinc-100 text-sm">Token Shipped</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    A virtual verification token has been shipped to **{recEmail || "your register inbox"}**. Redirecting to reset workspace...
                  </p>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs text-zinc-400 font-sans font-medium uppercase tracking-wider mb-1.5">
                      Target Email Address
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                        <Mail size={14} />
                      </span>
                      <input
                        type="email"
                        required
                        placeholder="john@organization.com"
                        value={recEmail}
                        onChange={(e) => setRecEmail(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-indigo-500 text-white rounded-lg text-sm pl-9 pr-3 py-2.5 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setView("login")}
                      className="flex-shrink-0 p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg transition-colors"
                      title="Back to Login"
                    >
                      <ArrowLeft size={16} />
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-sm font-semibold rounded-lg py-2.5 hover:shadow-lg transition-all"
                    >
                      Issue Crypto Token
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* CRYPTO RESET PASSWORD VIEW */}
          {view === "reset" && (
            <div>
              <div className="mb-6 text-center">
                <h2 className="text-xl font-sans font-semibold text-white tracking-tight">
                  Update Master Password
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Redeem verification token and establish a new secure key.
                </p>
              </div>

              {resetSuccess ? (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center space-y-2">
                  <div className="flex justify-center text-emerald-400">
                    <CheckCircle size={32} />
                  </div>
                  <h3 className="font-semibold text-zinc-100 text-sm">Key Decrypted</h3>
                  <p className="text-xs text-zinc-400">
                    Master lock key has been realigned. Returning to primary gateway...
                  </p>
                </div>
              ) : (
                <form onSubmit={handleResetSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs text-zinc-400 font-sans font-medium uppercase tracking-wider mb-1.5">
                      Verification Token
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. TOK-8291"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-indigo-500 text-white rounded-lg text-sm px-3.5 py-2.5 tracking-wider font-mono transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-zinc-400 font-sans font-medium uppercase tracking-wider mb-1.5">
                      New Master Password
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                        <Lock size={14} />
                      </span>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={resetNewPass}
                        onChange={(e) => setResetNewPass(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-indigo-500 text-white rounded-lg text-sm pl-9 pr-3 py-2.5 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-sm font-semibold rounded-lg py-2.5 hover:shadow-lg transition-all"
                    >
                      Authorize Key Reset
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
