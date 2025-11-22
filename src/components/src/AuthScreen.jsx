import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { auth, t, Icons, db } from "../App"; // استيراد الـ Constants والـ Firebase

const AuthScreen = ({ lang, setLang, dark, setDark, setAppRole, appId }) => {
  const [isReg, setReg] = useState(false);
  const [email, setE] = useState("");
  const [pass, setP] = useState("");
  const [college, setCollege] = useState("");
  const [seniority, setSeniority] = useState("junior");
  const [loading, setL] = useState(false);
  const txt = t[lang];

  const doctorsColRef = collection(
    db,
    `artifacts/${appId}/public/data/doctors`
  );

  const handleAuth = async (e) => {
    e.preventDefault();
    setL(true);
    try {
      if (isReg) {
        // --- عملية التسجيل (Sign Up) ---
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          pass
        );
        const user = userCredential.user;
        const userRef = doc(doctorsColRef, user.uid);

        const adminInitRef = doc(doctorsColRef, "admin_init");
        const adminInitSnap = await getDoc(adminInitRef);

        let initialRole = "pending";
        if (!adminInitSnap.exists()) {
          initialRole = "admin";
          await setDoc(adminInitRef, {
            initialized: true,
            userId: user.uid,
            email: user.email,
            createdAt: serverTimestamp(),
          });
        }

        await setDoc(userRef, {
          email: user.email,
          role: initialRole,
          college: college,
          seniority: seniority,
          createdAt: serverTimestamp(),
        });

        setAppRole(initialRole);
      } else {
        // --- عملية تسجيل الدخول (Sign In) ---
        await signInWithEmailAndPassword(auth, email, pass);
      }
    } catch (err) {
      console.error("Auth Error:", err);
      alert(
        lang === "ar"
          ? "خطأ في البريد أو كلمة المرور، أو الحساب غير مفعّل."
          : "Error with email/password, or account is not active."
      );
    }
    setL(false);
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
        dark ? "bg-slate-900" : "bg-slate-50"
      }`}
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <div
        className={`p-8 rounded-2xl shadow-lg w-full max-w-md border ${
          dark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-100"
        }`}
      >
        <div className="flex justify-between mb-4">
          <button onClick={() => setDark(!dark)} className="text-xl">
            {dark ? <Icons.Sun /> : <Icons.Moon />}
          </button>
          <button
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="text-xs font-bold text-blue-600"
          >
            {txt.lang}
          </button>
        </div>
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-blue-600 text-white rounded-xl mb-3">
            <Icons.Activity className="w-6 h-6" />
          </div>
          <h1
            className={`text-2xl font-bold ${
              dark ? "text-white" : "text-slate-800"
            }`}
          >
            {txt.appTitle}
          </h1>
        </div>
        <form onSubmit={handleAuth} className="space-y-4">
          <input
            className={`w-full p-3 border rounded-lg outline-none ${
              dark ? "bg-slate-700 border-slate-600 text-white" : "bg-white"
            }`}
            placeholder={txt.email}
            type="email"
            value={email}
            onChange={(e) => setE(e.target.value)}
            required
          />
          <input
            className={`w-full p-3 border rounded-lg outline-none ${
              dark ? "bg-slate-700 border-slate-600 text-white" : "bg-white"
            }`}
            placeholder={txt.pass}
            type="password"
            value={pass}
            onChange={(e) => setP(e.target.value)}
            required
          />
          {isReg && (
            <div className="space-y-4">
              <input
                className={`w-full p-3 border rounded-lg outline-none ${
                  dark ? "bg-slate-700 border-slate-600 text-white" : "bg-white"
                }`}
                placeholder={txt.college}
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                required
              />
              <select
                className={`w-full p-3 border rounded-lg outline-none ${
                  dark ? "bg-slate-700 border-slate-600 text-white" : "bg-white"
                }`}
                value={seniority}
                onChange={(e) => setSeniority(e.target.value)}
              >
                <option value="junior">{txt.junior}</option>
                <option value="mid">{txt.mid}</option>
                <option value="senior">{txt.senior}</option>
              </select>
            </div>
          )}
          <button
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-all"
          >
            {loading ? "..." : isReg ? txt.registerBtn : txt.loginBtn}
          </button>
        </form>
        <div className="mt-4 text-sm text-center">
          <button
            onClick={() => setReg(!isReg)}
            className="text-blue-500 hover:text-blue-600 font-medium"
          >
            {isReg ? txt.login : txt.registerBtn}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
