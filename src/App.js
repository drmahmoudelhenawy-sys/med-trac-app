import React, { useState, useEffect, useMemo, useRef } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  arrayUnion,
} from "firebase/firestore";

// ---------------------------------------------------------
// إعدادات Firebase
// ---------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyD3iB9CctcT4mb6kc9LKOGNxCw1GmCTj3U",
  authDomain: "med-trac-b60fe.firebaseapp.com",
  projectId: "med-trac-b60fe",
  storageBucket: "med-trac-b60fe.firebasestorage.app",
  messagingSenderId: "129709526430",
  appId: "1:129709526430:web:7aa52d9ade5a905be39a8f",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ---------------------------------------------------------
// القاموس
// ---------------------------------------------------------
const t = {
  ar: {
    appTitle: "ميد-تراك",
    dashboard: "لوحة المعلومات",
    patients: "المرضى",
    addPatient: "تسجيل مريض",
    logout: "خروج",
    darkMode: "الوضع الليلي",
    lang: "English",
    searchPlaceholder: "بحث باسم المريض...",
    advancedSearch: "بحث متقدم",
    printReport: "طباعة تقرير حالة (PDF)",
    printStats: "طباعة تقرير إحصائي (PDF)",
    reportTitle: "تقرير حالة طبية",
    statsTitle: "التقرير الإحصائي العام",
    medicalHistory: "السجل الطبي",
    noRecords: "لا توجد سجلات",
    save: "حفظ",
    cancel: "إلغاء",
    status: "الحالة",
    dept: "القسم",
    all: "الكل",
    allDepts: "كل الأقسام",
    critical: "حرج",
    stable: "مستقر",
    observation: "ملاحظة",
    loginBtn: "دخول",
    createAcc: "حساب جديد",
    diagnosis: "تشخيص",
    treatment: "علاج",
    radiology: "أشعة",
    note: "ملاحظة",
    upload: "صورة",
    addRecord: "إضافة",
    details: "التفاصيل",
    type: "النوع",
    timeline: "تطور الحالة",
    writtenBy: "كتبه",
    confirmDelete: "حذف نهائي؟",
    profileSetup: "بيانات الطبيب",
    fullName: "الاسم",
    college: "الكلية",
    specialty: "التخصص",
    role: "الدور",
    doc: "طبيب",
    nurse: "تمريض",
    admin: "مدير",
    saveStart: "بدء العمل",
    male: "ذكر",
    female: "أنثى",
    email: "البريد",
    pass: "كلمة المرور",
    haveAcc: "دخول",
    noAcc: "تسجيل",
    totalPatients: "إجمالي المرضى",
    criticalCases: "حالات حرجة",
    healthStatus: "الحالة الصحية",
    deptDist: "التوزيع بالأقسام",
    name: "الاسم",
    age: "العمر",
    presentation: "الشكوى",
    date: "التاريخ",
    generatedOn: "تاريخ التقرير",
    welcomeVerse: "وَمَنْ أَحْيَاهَا فَكَأَنَّمَا أَحْيَا النَّاسَ جَمِيعًا",
    loadingData: "تم تسجيل الدخول بنجاح",
  },
  en: {
    appTitle: "MED-TRAC",
    dashboard: "Dashboard",
    patients: "Patients",
    addPatient: "Add Patient",
    logout: "Logout",
    darkMode: "Dark Mode",
    lang: "عربي",
    searchPlaceholder: "Search patient...",
    advancedSearch: "Advanced Search",
    printReport: "Print Case Report (PDF)",
    printStats: "Print Statistics (PDF)",
    reportTitle: "Medical Report",
    statsTitle: "General Statistics Report",
    medicalHistory: "Medical History",
    noRecords: "No records",
    save: "Save",
    cancel: "Cancel",
    status: "Status",
    dept: "Department",
    all: "All",
    allDepts: "All Depts",
    critical: "Critical",
    stable: "Stable",
    observation: "Observation",
    loginBtn: "Login",
    createAcc: "Sign Up",
    diagnosis: "Diagnosis",
    treatment: "Treatment",
    radiology: "Radiology",
    note: "Note",
    upload: "Image",
    addRecord: "Add",
    details: "Details",
    type: "Type",
    timeline: "Timeline",
    writtenBy: "By",
    confirmDelete: "Delete?",
    profileSetup: "Profile",
    fullName: "Name",
    college: "College",
    specialty: "Specialty",
    role: "Role",
    doc: "Doctor",
    nurse: "Nurse",
    admin: "Admin",
    saveStart: "Start",
    male: "Male",
    female: "Female",
    email: "Email",
    pass: "Password",
    haveAcc: "Login",
    noAcc: "Register",
    totalPatients: "Total Patients",
    criticalCases: "Critical",
    healthStatus: "Health Status",
    deptDist: "Dept Dist.",
    name: "Name",
    age: "Age",
    presentation: "Presentation",
    date: "Date",
    generatedOn: "Generated On",
    welcomeVerse:
      "And whoever saves one - it is as if he had saved mankind entirely",
    loadingData: "Login Successful",
  },
};

// --- الأيقونات ---
const Icons = {
  Menu: () => (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  ),
  Dashboard: () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
      />
    </svg>
  ),
  Users: () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  ),
  AddUser: () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
      />
    </svg>
  ),
  Activity: () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    </svg>
  ),
  Logout: () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
      />
    </svg>
  ),
  Print: () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
      />
    </svg>
  ),
  Filter: () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
      />
    </svg>
  ),
  Trash: () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  ),
  Upload: () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
      />
    </svg>
  ),
  Back: () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 19l-7-7m0 0l7-7m-7 7h18"
      />
    </svg>
  ),
  Search: () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  ),
  Edit: () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    </svg>
  ),
  Save: () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  ),
  Close: () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  ),
  Sun: () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  ),
  Moon: () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  ),
  Quran: () => (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    </svg>
  ),
};

// --- مكونات الواجهة ---
const StatCard = ({ title, value, icon, color, dark }) => (
  <div
    className={`p-5 rounded-xl shadow-sm border-r-4 flex justify-between items-center transition-all ${
      dark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-100"
    } ${
      color === "blue"
        ? "border-blue-500"
        : color === "green"
        ? "border-green-500"
        : "border-purple-500"
    }`}
  >
    <div>
      <p className={`text-sm ${dark ? "text-gray-400" : "text-gray-500"}`}>
        {title}
      </p>
      <h3
        className={`text-2xl font-bold ${
          dark ? "text-white" : "text-slate-800"
        }`}
      >
        {value}
      </h3>
    </div>
    <div
      className={`p-2 rounded-full ${
        color === "blue"
          ? dark
            ? "bg-blue-900 text-blue-300"
            : "bg-blue-50 text-blue-600"
          : color === "green"
          ? dark
            ? "bg-green-900 text-green-300"
            : "bg-green-50 text-green-600"
          : dark
          ? "bg-purple-900 text-purple-300"
          : "bg-purple-50 text-purple-600"
      }`}
    >
      {icon}
    </div>
  </div>
);

// --- Donut Chart ---
const DonutChart = ({ data, dark }) => {
  const total = data.reduce((acc, curr) => acc + curr.val, 0);
  const colors = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#EC4899",
  ];
  let currentPos = 0;
  const styleString = data
    .map((d, i) => {
      const pct = total === 0 ? 0 : (d.val / total) * 100;
      const color = colors[i % colors.length];
      const start = currentPos;
      currentPos += pct;
      return `${color} ${start}% ${currentPos}%`;
    })
    .join(", ");

  return (
    <div className="flex items-center justify-around gap-4 mt-4">
      <div
        className="relative w-32 h-32 rounded-full flex items-center justify-center shadow-inner"
        style={{
          background: total > 0 ? `conic-gradient(${styleString})` : "#e2e8f0",
        }}
      >
        <div
          className={`w-24 h-24 rounded-full flex items-center justify-center text-sm font-bold flex-col ${
            dark ? "bg-slate-800 text-white" : "bg-white text-gray-700"
          }`}
        >
          <span className="text-xl">{total}</span>
          <span className="text-[10px] text-gray-400">حالة</span>
        </div>
      </div>
      <div className="flex-1 space-y-2">
        {data.map((d, i) => {
          const pct = total === 0 ? 0 : ((d.val / total) * 100).toFixed(1);
          const color = colors[i % colors.length];
          return (
            <div key={i} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shadow-sm"
                  style={{ backgroundColor: color }}
                ></span>
                <span className={dark ? "text-gray-300" : "text-gray-600"}>
                  {d.label}
                </span>
              </div>
              <span
                className={`font-bold ${
                  dark ? "text-gray-200" : "text-gray-700"
                }`}
              >
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- شاشة الدخول ---
const AuthScreen = ({ lang, setLang, dark, setDark }) => {
  const [isReg, setIsReg] = useState(false);
  const [email, setE] = useState("");
  const [pass, setP] = useState("");
  const [loading, setL] = useState(false);
  const txt = t[lang];

  const handle = async (e) => {
    e.preventDefault();
    setL(true);
    try {
      if (isReg) await createUserWithEmailAndPassword(auth, email, pass);
      else await signInWithEmailAndPassword(auth, email, pass);
    } catch (err) {
      alert(err.message);
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
            {dark ? "☀️" : "🌙"}
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
            <Icons.Activity />
          </div>
          <h1
            className={`text-2xl font-bold ${
              dark ? "text-white" : "text-slate-800"
            }`}
          >
            {txt.appTitle}
          </h1>
        </div>
        <form onSubmit={handle} className="space-y-4">
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
          <button
            disabled={loading}
            className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-all"
          >
            {loading ? "..." : isReg ? txt.createAcc : txt.loginBtn}
          </button>
        </form>
        <button
          onClick={() => setIsReg(!isReg)}
          className="w-full mt-4 text-sm text-blue-600 hover:underline"
        >
          {isReg ? txt.haveAcc : txt.noAcc}
        </button>
      </div>
    </div>
  );
};

// --- إكمال البيانات ---
const ProfileSetup = ({ user, onComplete, lang, dark }) => {
  const [name, setName] = useState("");
  const [college, setCollege] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [gender, setGender] = useState("male");
  const [role, setRole] = useState("doctor");
  const txt = t[lang];

  useEffect(() => {
    if (user.email === "admin@medtrac.com") {
      setRole("admin");
      setName("المدير العام");
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(user, { displayName: name });
      await setDoc(doc(db, "doctors", user.uid), {
        name,
        college,
        specialty,
        gender,
        role,
        email: user.email,
        createdAt: serverTimestamp(),
      });
      onComplete();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 ${
        dark ? "bg-slate-900" : "bg-slate-50"
      }`}
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <div
        className={`p-8 rounded-2xl shadow-lg w-full max-w-lg border ${
          dark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-100"
        }`}
      >
        <h2
          className={`text-2xl font-bold text-center mb-6 ${
            dark ? "text-white" : "text-slate-800"
          }`}
        >
          {txt.profileSetup}
        </h2>
        <form onSubmit={handleSave} className="space-y-4">
          <input
            className={`w-full p-3 border rounded-lg ${
              dark ? "bg-slate-700 border-slate-600 text-white" : ""
            }`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder={txt.fullName}
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              className={`w-full p-3 border rounded-lg ${
                dark ? "bg-slate-700 border-slate-600 text-white" : ""
              }`}
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              required
              placeholder={txt.college}
            />
            <input
              className={`w-full p-3 border rounded-lg ${
                dark ? "bg-slate-700 border-slate-600 text-white" : ""
              }`}
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              required
              placeholder={txt.specialty}
            />
          </div>
          {user.email !== "admin@medtrac.com" && (
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={`w-full p-3 border rounded-lg ${
                dark ? "bg-slate-700 border-slate-600 text-white" : ""
              }`}
            >
              <option value="doctor">{txt.doc}</option>
              <option value="nurse">{txt.nurse}</option>
            </select>
          )}
          {user.email === "admin@medtrac.com" && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-center font-bold">
              تم التعرف عليك: مدير النظام
            </div>
          )}
          <div className="flex gap-4 justify-center">
            <label
              className={`flex items-center gap-2 ${dark ? "text-white" : ""}`}
            >
              <input
                type="radio"
                name="g"
                value="male"
                onChange={() => setGender("male")}
                checked={gender === "male"}
              />{" "}
              {txt.male} 👨‍⚕️
            </label>
            <label
              className={`flex items-center gap-2 ${dark ? "text-white" : ""}`}
            >
              <input
                type="radio"
                name="g"
                value="female"
                onChange={() => setGender("female")}
                checked={gender === "female"}
              />{" "}
              {txt.female} 👩‍⚕️
            </label>
          </div>
          <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold">
            {txt.saveStart}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- التطبيق الرئيسي ---
export default function MedicalApp() {
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [patients, setPatients] = useState([]);
  const [view, setView] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lang, setLang] = useState("ar");
  const [dark, setDark] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showAdvSearch, setShowAdvSearch] = useState(false);
  const [isEditingPresentation, setIsEditingPresentation] = useState(false);
  const [newPresentation, setNewPresentation] = useState("");

  const txt = t[lang];

  useEffect(() => {
    // --- الستايلات والطباعة فقط ---
    const style = document.createElement("style");
    style.innerHTML = `
      @media print {
        .no-print { display: none !important; }
        .print-only { display: block !important; }
        body { background: white !important; color: black !important; -webkit-print-color-adjust: exact; }
        .print-card { border: 1px solid #ddd; padding: 15px; margin-bottom: 15px; border-radius: 8px; }
        .print-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .print-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .print-table th, .print-table td { border: 1px solid #ccc; padding: 8px; text-align: right; }
      }
      .print-only { display: none; }
      @keyframes bounceIn {
        0% { transform: translate(-50%, -100%); opacity: 0; }
        60% { transform: translate(-50%, 20px); opacity: 1; }
        100% { transform: translate(-50%, 0); }
      }
      .animate-bounce-in { animation: bounceIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards; }
    `;
    document.head.appendChild(style);

    if (!document.getElementById("tailwind-script")) {
      const script = document.createElement("script");
      script.id = "tailwind-script";
      script.src = "https://cdn.tailwindcss.com";
      script.onload = () => {
        if (window.tailwind) {
          window.tailwind.config = { darkMode: "class", theme: { extend: {} } };
        }
      };
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [dark]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        const docSnap = await getDoc(doc(db, "doctors", u.uid));
        if (docSnap.exists()) {
          setProfileData(docSnap.data());
          setShowWelcome(true);
          setTimeout(() => setShowWelcome(false), 5000);
        }
        setUser(u);
      } else {
        setUser(null);
        setProfileData(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (user && profileData) {
      const q = query(collection(db, "patients"), orderBy("createdAt", "desc"));
      const unsub = onSnapshot(q, (snap) =>
        setPatients(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
      );
      return () => unsub();
    }
  }, [user, profileData]);

  const handleAdd = async (e) => {
    e.preventDefault();
    const form = e.target;
    try {
      await addDoc(collection(db, "patients"), {
        name: form.name.value,
        age: form.age.value,
        department: form.dept.value,
        status: form.status.value,
        presentation: form.presentation.value,
        admissionDate: new Date().toISOString().split("T")[0],
        creator: profileData.name,
        creatorId: user.uid,
        createdAt: serverTimestamp(),
        history: [],
      });
      setView("dashboard");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    const isCreator = patients.find((p) => p.id === id)?.creatorId === user.uid;
    const isAdmin = profileData.role === "admin";
    if (!isAdmin && !isCreator) return alert("غير مسموح بحذف حالات زملائك.");
    if (profileData.role === "nurse") return alert("Access Denied");
    if (window.confirm(txt.confirmDelete)) {
      try {
        await deleteDoc(doc(db, "patients", id));
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleUpdatePresentation = async () => {
    try {
      await updateDoc(doc(db, "patients", selectedPatient.id), {
        presentation: newPresentation,
      });
      setSelectedPatient({ ...selectedPatient, presentation: newPresentation });
      setIsEditingPresentation(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddEntry = async (e) => {
    e.preventDefault();
    const form = e.target;
    const file = form.file.files[0];
    const toBase64 = (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });
    let imgStr = "";
    if (file) {
      if (file.size > 800000) return alert("Max 800KB");
      imgStr = await toBase64(file);
    }
    const newEntry = {
      type: form.type.value,
      note: form.note.value,
      date: new Date().toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US"),
      doctor: profileData.name,
      image: imgStr,
    };
    try {
      await updateDoc(doc(db, "patients", selectedPatient.id), {
        history: arrayUnion(newEntry),
      });
      const updatedHistory = [...(selectedPatient.history || []), newEntry];
      setSelectedPatient({ ...selectedPatient, history: updatedHistory });
      form.reset();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredPatients = patients.filter((p) => {
    const matchesSearch = p.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesDept = filterDept === "all" || p.department === filterDept;
    const matchesStatus = filterStatus === "all" || p.status === filterStatus;
    let matchesDate = true;
    if (dateFrom && new Date(p.admissionDate) < new Date(dateFrom))
      matchesDate = false;
    if (dateTo && new Date(p.admissionDate) > new Date(dateTo))
      matchesDate = false;
    return matchesSearch && matchesDept && matchesStatus && matchesDate;
  });

  const stats = {
    total: patients.length,
    critical: patients.filter((p) => p.status === "حرج").length,
    stable: patients.filter((p) => p.status === "مستقر").length,
    obs: patients.filter((p) => p.status === "تحت الملاحظة").length,
    depts: [...new Set(patients.map((p) => p.department))].length,
  };
  const chartStatus = [
    { label: txt.critical, val: stats.critical },
    { label: txt.observation, val: stats.obs },
    { label: txt.stable, val: stats.stable },
  ];
  const deptCounts = patients.reduce((acc, p) => {
    acc[p.department] = (acc[p.department] || 0) + 1;
    return acc;
  }, {});
  const chartDepts = Object.keys(deptCounts).map((k) => ({
    label: k,
    val: deptCounts[k],
  }));

  const handlePrint = () => window.print();

  if (loading)
    return (
      <div
        className={`h-screen flex items-center justify-center ${
          dark ? "bg-slate-900 text-white" : "text-blue-600"
        }`}
      >
        ...
      </div>
    );
  if (!user)
    return (
      <AuthScreen lang={lang} setLang={setLang} dark={dark} setDark={setDark} />
    );
  if (!profileData)
    return (
      <ProfileSetup
        user={user}
        onComplete={() => window.location.reload()}
        lang={lang}
        dark={dark}
      />
    );

  const SidebarBtn = ({ icon, text, active, onClick }) => (
    <button
      onClick={() => {
        onClick();
        setMobileMenuOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        active
          ? "bg-blue-50 text-blue-700 font-bold dark:bg-blue-900 dark:text-blue-300"
          : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-slate-700"
      }`}
    >
      {icon} {text}
    </button>
  );

  return (
    <div
      className={`flex h-screen font-sans ${
        dark ? "bg-slate-900 text-white" : "bg-slate-50"
      } transition-colors`}
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      {showWelcome && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-white dark:bg-slate-800 border-r-4 border-blue-600 shadow-2xl z-50 p-4 rounded-xl flex items-center gap-4 animate-bounce-in">
          <div className="text-blue-600 text-2xl">
            <Icons.Quran />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-serif">
              {txt.welcomeVerse}
            </p>
            <p className="text-xs font-bold text-slate-800 dark:text-white mt-1">
              {txt.loadingData}
            </p>
          </div>
        </div>
      )}

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 right-0 z-50 w-64 shadow-sm border-gray-100 flex flex-col transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
        } ${
          dark ? "bg-slate-800 border-r border-slate-700" : "bg-white border-l"
        }`}
      >
        <div
          className={`p-6 flex items-center justify-between font-bold text-xl border-b ${
            dark ? "text-white border-slate-700" : "text-blue-700"
          }`}
        >
          <div className="flex items-center gap-3">
            <Icons.Activity />
            <span>{txt.appTitle}</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-gray-500"
          >
            <Icons.Close />
          </button>
        </div>
        <div className="flex-1 py-6 space-y-1 px-3">
          <SidebarBtn
            icon={<Icons.Dashboard />}
            text={txt.dashboard}
            active={view === "dashboard"}
            onClick={() => {
              setView("dashboard");
              setSelectedPatient(null);
            }}
          />
          <SidebarBtn
            icon={<Icons.Users />}
            text={txt.patients}
            active={view === "list"}
            onClick={() => {
              setView("list");
              setSelectedPatient(null);
            }}
          />
          <SidebarBtn
            icon={<Icons.AddUser />}
            text={txt.addPatient}
            active={view === "add"}
            onClick={() => {
              setView("add");
              setSelectedPatient(null);
            }}
          />
        </div>
        <div className="p-4 border-t">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setDark(!dark)}
              className="flex-1 py-2 bg-gray-100 dark:bg-slate-700 rounded-lg flex justify-center"
            >
              {dark ? "☀️" : "🌙"}
            </button>
            <button
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              className="flex-1 py-2 bg-gray-100 dark:bg-slate-700 rounded-lg font-bold text-blue-600 dark:text-blue-400"
            >
              {txt.lang}
            </button>
          </div>
          <div className="flex items-center gap-3 mb-3 px-2">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-xl border ${
                dark ? "bg-slate-700 border-slate-600" : "bg-white"
              }`}
            >
              {profileData?.gender === "male" ? "👨‍⚕️" : "👩‍⚕️"}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">{profileData?.name}</p>
              <p className="text-xs text-gray-400 uppercase">
                {profileData?.role}
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut(auth)}
            className="w-full flex items-center gap-2 justify-center text-red-500 hover:bg-red-50 dark:hover:bg-slate-700 py-2 rounded-lg transition-colors text-sm"
          >
            <Icons.Logout /> {txt.logout}
          </button>
        </div>
      </aside>

      <main
        className={`flex-1 overflow-y-auto no-print ${
          dark ? "bg-slate-900" : "bg-slate-50"
        }`}
      >
        <div
          className={`md:hidden p-4 flex justify-between items-center shadow-sm sticky top-0 z-30 ${
            dark ? "bg-slate-800 text-white" : "bg-white text-slate-800"
          }`}
        >
          <div className="flex items-center gap-2 font-bold">
            <Icons.Activity /> {txt.appTitle}
          </div>
          <button onClick={() => setMobileMenuOpen(true)}>
            <Icons.Menu />
          </button>
        </div>

        <div className="p-6 max-w-6xl mx-auto">
          {view === "dashboard" && !selectedPatient && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center">
                <h2
                  className={`text-2xl font-bold ${
                    dark ? "text-white" : "text-slate-800"
                  }`}
                >
                  {txt.dashboard}
                </h2>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-900"
                >
                  <Icons.Print /> {txt.printStats}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                  title={txt.totalPatients}
                  value={stats.total}
                  icon={<Icons.Users />}
                  color="blue"
                  dark={dark}
                />
                <StatCard
                  title={txt.criticalCases}
                  value={stats.critical}
                  icon={<Icons.Activity />}
                  color="green"
                  dark={dark}
                />
                <StatCard
                  title={txt.observation}
                  value={stats.obs}
                  icon={<Icons.Dashboard />}
                  color="purple"
                  dark={dark}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div
                  className={`p-6 rounded-2xl shadow-sm border ${
                    dark
                      ? "bg-slate-800 border-slate-700"
                      : "bg-white border-gray-100"
                  }`}
                >
                  <h3
                    className={`font-bold ${
                      dark ? "text-white" : "text-gray-700"
                    }`}
                  >
                    {txt.healthStatus}
                  </h3>
                  <DonutChart data={chartStatus} dark={dark} />
                </div>
                <div
                  className={`p-6 rounded-2xl shadow-sm border ${
                    dark
                      ? "bg-slate-800 border-slate-700"
                      : "bg-white border-gray-100"
                  }`}
                >
                  <h3
                    className={`font-bold ${
                      dark ? "text-white" : "text-gray-700"
                    }`}
                  >
                    {txt.deptDist}
                  </h3>
                  <DonutChart data={chartDepts} dark={dark} />
                </div>
              </div>
            </div>
          )}

          {view === "list" && !selectedPatient && (
            <div className="animate-fadeIn">
              <div className="flex flex-col gap-4 mb-6">
                <div className="flex justify-between items-center">
                  <h2
                    className={`text-2xl font-bold ${
                      dark ? "text-white" : "text-slate-800"
                    }`}
                  >
                    {txt.patients}
                  </h2>
                  <button
                    onClick={() => setShowAdvSearch(!showAdvSearch)}
                    className="text-sm text-blue-600 font-bold flex items-center gap-1"
                  >
                    <Icons.Filter /> {txt.advancedSearch}
                  </button>
                </div>
                {showAdvSearch && (
                  <div
                    className={`p-4 rounded-xl shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 border ${
                      dark
                        ? "bg-slate-800 border-slate-700"
                        : "bg-white border-blue-100"
                    }`}
                  >
                    <input
                      className={`p-2 border rounded-lg ${
                        dark ? "bg-slate-700 border-slate-600 text-white" : ""
                      }`}
                      placeholder={txt.searchPlaceholder}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <select
                      className={`p-2 border rounded-lg ${
                        dark ? "bg-slate-700 border-slate-600 text-white" : ""
                      }`}
                      value={filterDept}
                      onChange={(e) => setFilterDept(e.target.value)}
                    >
                      <option value="all">{txt.allDepts}</option>
                      <option>الطوارئ</option>
                      <option>الباطنة</option>
                      <option>الجراحة</option>
                      <option>القلب</option>
                    </select>
                    <select
                      className={`p-2 border rounded-lg ${
                        dark ? "bg-slate-700 border-slate-600 text-white" : ""
                      }`}
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="all">{txt.all}</option>
                      <option value="مستقر">{txt.stable}</option>
                      <option value="حرج">{txt.critical}</option>
                    </select>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        className={`w-full p-2 border rounded-lg text-xs ${
                          dark ? "bg-slate-700 border-slate-600 text-white" : ""
                        }`}
                        onChange={(e) => setDateFrom(e.target.value)}
                      />
                      <input
                        type="date"
                        className={`w-full p-2 border rounded-lg text-xs ${
                          dark ? "bg-slate-700 border-slate-600 text-white" : ""
                        }`}
                        onChange={(e) => setDateTo(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="grid gap-4">
                {filteredPatients.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedPatient(p);
                      setNewPresentation(p.presentation);
                    }}
                    className={`p-5 rounded-xl shadow-sm border hover:shadow-md cursor-pointer flex justify-between items-center ${
                      dark
                        ? "bg-slate-800 border-slate-700"
                        : "bg-white border-gray-100"
                    }`}
                  >
                    <div>
                      <h3
                        className={`font-bold text-lg ${
                          dark ? "text-white" : "text-slate-800"
                        }`}
                      >
                        {p.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {p.department} • {p.creator}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          p.status === "حرج"
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {p.status}
                      </span>
                      {(profileData.role === "admin" ||
                        p.creatorId === user.uid) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(p.id);
                          }}
                          className="p-2 text-gray-300 hover:text-red-500"
                        >
                          <Icons.Trash />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedPatient && (
            <div className="animate-fadeIn space-y-6">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="flex items-center gap-2 text-gray-500 hover:text-blue-600"
                >
                  <Icons.Back /> {txt.cancel}
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-900"
                >
                  <Icons.Print /> {txt.printReport}
                </button>
              </div>
              <div
                className={`p-6 rounded-2xl shadow-sm border-t-4 border-blue-600 ${
                  dark ? "bg-slate-800" : "bg-white"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h1
                      className={`text-3xl font-bold ${
                        dark ? "text-white" : "text-slate-800"
                      }`}
                    >
                      {selectedPatient.name}
                    </h1>
                    <p className="text-gray-500 mt-1">
                      {selectedPatient.admissionDate} | {selectedPatient.age} Y
                    </p>
                  </div>
                  <span
                    className={`px-4 py-2 rounded-lg font-bold ${
                      dark
                        ? "bg-slate-700 text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {selectedPatient.status}
                  </span>
                </div>

                <div
                  className={`mt-4 p-4 rounded-xl text-sm relative group ${
                    dark
                      ? "bg-blue-900/20 text-blue-200"
                      : "bg-blue-50 text-blue-800"
                  }`}
                >
                  <strong>{txt.presentation}:</strong>
                  {isEditingPresentation ? (
                    <div className="mt-2 flex gap-2">
                      <textarea
                        value={newPresentation}
                        onChange={(e) => setNewPresentation(e.target.value)}
                        className={`flex-1 p-2 border rounded-lg ${
                          dark ? "bg-slate-700 border-slate-600 text-white" : ""
                        }`}
                        rows="3"
                      />
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={handleUpdatePresentation}
                          className="p-2 bg-green-500 text-white rounded-lg"
                        >
                          <Icons.Save />
                        </button>
                        <button
                          onClick={() => setIsEditingPresentation(false)}
                          className="p-2 bg-gray-300 text-gray-700 rounded-lg"
                        >
                          <Icons.Close />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-1 pr-6 relative">
                      {selectedPatient.presentation}
                      {(profileData.role === "admin" ||
                        selectedPatient.creatorId === user.uid) && (
                        <button
                          onClick={() => setIsEditingPresentation(true)}
                          className="absolute top-0 right-0 p-1 text-blue-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Icons.Edit />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div
                  className={`p-6 rounded-2xl shadow-sm h-fit border ${
                    dark
                      ? "bg-slate-800 border-slate-700"
                      : "bg-white border-gray-100"
                  }`}
                >
                  <h3
                    className={`font-bold mb-4 ${
                      dark ? "text-white" : "text-gray-700"
                    }`}
                  >
                    {txt.addRecord}
                  </h3>
                  <form onSubmit={handleAddEntry} className="space-y-4">
                    <select
                      name="type"
                      className={`w-full p-3 rounded-xl border outline-none ${
                        dark
                          ? "bg-slate-700 border-slate-600 text-white"
                          : "bg-gray-50"
                      }`}
                    >
                      <option value="diagnosis">{txt.diagnosis}</option>
                      <option value="treatment">{txt.treatment}</option>
                      <option value="radiology">{txt.radiology}</option>
                      <option value="note">{txt.note}</option>
                    </select>
                    <textarea
                      name="note"
                      rows="3"
                      className={`w-full p-3 rounded-xl border outline-none ${
                        dark
                          ? "bg-slate-700 border-slate-600 text-white"
                          : "bg-gray-50"
                      }`}
                      placeholder="..."
                      required
                    ></textarea>
                    <label
                      className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer ${
                        dark
                          ? "bg-slate-700 border-slate-600 hover:bg-slate-600"
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      <Icons.Upload />{" "}
                      <span
                        className={`text-sm ${
                          dark ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {txt.upload}
                      </span>
                      <input
                        type="file"
                        name="file"
                        className="hidden"
                        accept="image/*"
                      />
                    </label>
                    <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700">
                      {txt.save}
                    </button>
                  </form>
                </div>
                <div className="space-y-4">
                  <h3
                    className={`font-bold ${
                      dark ? "text-white" : "text-gray-700"
                    }`}
                  >
                    {txt.timeline}
                  </h3>
                  {selectedPatient.history &&
                    selectedPatient.history
                      .slice()
                      .reverse()
                      .map((item, i) => (
                        <div
                          key={i}
                          className={`p-4 rounded-xl border shadow-sm ${
                            dark
                              ? "bg-slate-800 border-slate-700"
                              : "bg-white border-gray-100"
                          }`}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded text-xs font-bold dark:text-white">
                              {item.type}
                            </span>
                            <span className="text-xs text-gray-400">
                              {item.date}
                            </span>
                          </div>
                          <p
                            className={`text-sm mb-2 ${
                              dark ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            {item.note}
                          </p>
                          {item.image && (
                            <img
                              src={item.image}
                              alt="img"
                              className="w-full rounded-lg border mt-2"
                            />
                          )}
                          <div className="text-xs text-gray-400 mt-2 border-t dark:border-slate-700 pt-2">
                            {txt.writtenBy}: {item.doctor}
                          </div>
                        </div>
                      ))}
                </div>
              </div>
            </div>
          )}

          {view === "add" && (
            <div
              className={`max-w-2xl mx-auto p-8 rounded-2xl shadow-sm animate-fadeIn border ${
                dark
                  ? "bg-slate-800 border-slate-700"
                  : "bg-white border-gray-100"
              }`}
            >
              <h2
                className={`text-xl font-bold mb-6 ${
                  dark ? "text-white" : "text-slate-800"
                }`}
              >
                {txt.addPatient}
              </h2>
              <form onSubmit={handleAdd} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    name="name"
                    className={`p-3 border rounded-xl outline-none col-span-2 ${
                      dark
                        ? "bg-slate-700 border-slate-600 text-white"
                        : "bg-gray-50"
                    }`}
                    placeholder={txt.name}
                    required
                  />
                  <input
                    name="age"
                    type="number"
                    className={`p-3 border rounded-xl outline-none ${
                      dark
                        ? "bg-slate-700 border-slate-600 text-white"
                        : "bg-gray-50"
                    }`}
                    placeholder={txt.age}
                    required
                  />
                  <select
                    name="dept"
                    className={`p-3 border rounded-xl outline-none ${
                      dark
                        ? "bg-slate-700 border-slate-600 text-white"
                        : "bg-gray-50"
                    }`}
                  >
                    <option>الطوارئ</option>
                    <option>الباطنة</option>
                    <option>الجراحة</option>
                    <option>القلب</option>
                    <option>العناية المركزة</option>
                  </select>
                </div>
                <textarea
                  name="presentation"
                  rows="3"
                  className={`w-full p-3 border rounded-xl outline-none ${
                    dark
                      ? "bg-slate-700 border-slate-600 text-white"
                      : "bg-gray-50"
                  }`}
                  placeholder={txt.presentation}
                  required
                ></textarea>
                <div className="grid grid-cols-3 gap-4">
                  <label className="cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="مستقر"
                      className="peer sr-only"
                      defaultChecked
                    />
                    <div
                      className={`text-center p-3 rounded-xl border peer-checked:bg-green-50 dark:peer-checked:bg-green-900 peer-checked:border-green-500 text-sm ${
                        dark ? "border-slate-600 text-white" : ""
                      }`}
                    >
                      {txt.stable}
                    </div>
                  </label>
                  <label className="cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="تحت الملاحظة"
                      className="peer sr-only"
                    />
                    <div
                      className={`text-center p-3 rounded-xl border peer-checked:bg-amber-50 dark:peer-checked:bg-amber-900 peer-checked:border-amber-500 text-sm ${
                        dark ? "border-slate-600 text-white" : ""
                      }`}
                    >
                      {txt.observation}
                    </div>
                  </label>
                  <label className="cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="حرج"
                      className="peer sr-only"
                    />
                    <div
                      className={`text-center p-3 rounded-xl border peer-checked:bg-red-50 dark:peer-checked:bg-red-900 peer-checked:border-red-500 text-sm ${
                        dark ? "border-slate-600 text-white" : ""
                      }`}
                    >
                      {txt.criticalCases}
                    </div>
                  </label>
                </div>
                <button className="w-full bg-slate-900 dark:bg-blue-600 text-white py-4 rounded-xl font-bold">
                  {txt.save}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>

      {!selectedPatient && view === "dashboard" && (
        <div className="print-only p-8 bg-white text-black">
          <div className="print-header">
            <h1 className="text-3xl font-bold">
              {txt.appTitle} - {txt.statsTitle}
            </h1>
            <p className="text-gray-500">
              {txt.generatedOn}: {new Date().toLocaleString()}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-8 text-center">
            <div className="print-card">
              <h3>{txt.totalPatients}</h3>
              <h2 className="text-2xl">{stats.total}</h2>
            </div>
            <div className="print-card">
              <h3>{txt.criticalCases}</h3>
              <h2 className="text-2xl">{stats.critical}</h2>
            </div>
            <div className="print-card">
              <h3>{txt.observation}</h3>
              <h2 className="text-2xl">{stats.obs}</h2>
            </div>
          </div>
          <h3 className="text-xl font-bold mb-2">{txt.deptDist}</h3>
          <table className="print-table">
            <thead>
              <tr>
                <th>{txt.dept}</th>
                <th>{txt.totalPatients}</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(deptCounts).map(([k, v]) => (
                <tr key={k}>
                  <td>{k}</td>
                  <td>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-10 pt-4 border-t text-center text-sm text-gray-400">
            Dr. {profileData?.name}
          </div>
        </div>
      )}
      {selectedPatient && (
        <div className="print-only p-8 bg-white text-black">
          <div className="text-center border-b pb-4 mb-6">
            <h1 className="text-3xl font-bold">
              {txt.appTitle} - {txt.reportTitle}
            </h1>
            <p className="text-gray-500">{new Date().toLocaleString()}</p>
          </div>
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="print-card">
              <strong>{txt.name}:</strong> {selectedPatient.name}
            </div>
            <div className="print-card">
              <strong>{txt.dept}:</strong> {selectedPatient.department} |{" "}
              <strong>{txt.age}:</strong> {selectedPatient.age}
            </div>
            <div className="col-span-2 print-card bg-gray-50">
              <strong>{txt.presentation}:</strong>{" "}
              {selectedPatient.presentation}
            </div>
          </div>
          <h3 className="text-xl font-bold mb-4 border-b pb-2">
            {txt.medicalHistory}
          </h3>
          <div className="space-y-4">
            {selectedPatient.history &&
              selectedPatient.history.map((h, i) => (
                <div key={i} className="border p-3 rounded">
                  <div className="flex justify-between font-bold">
                    <span>{h.type}</span>
                    <span>{h.date}</span>
                  </div>
                  <p className="mt-1">{h.note}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {txt.writtenBy}: {h.doctor}
                  </p>
                </div>
              ))}
          </div>
          <div className="mt-10 pt-4 border-t text-center text-sm text-gray-400">
            Dr. {profileData?.name}
          </div>
        </div>
      )}
    </div>
  );
}
