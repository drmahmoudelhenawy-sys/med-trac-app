import React, { useState, useEffect, useMemo, useRef } from "react";
// استيراد أدوات Firebase
import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInAnonymously,
  signInWithCustomToken,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  collection,
  query,
  where,
  updateDoc,
  deleteDoc,
  orderBy,
  serverTimestamp,
  arrayUnion,
} from "firebase/firestore";

// ---------------------------------------------------------
// إعدادات Firebase (يجب أن تبقى كما هي)
// ---------------------------------------------------------
const appId = typeof __app_id !== "undefined" ? __app_id : "default-app-id";
const firebaseConfig =
  typeof __firebase_config !== "undefined" ? JSON.parse(__firebase_config) : {};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// دالة توقيع المستخدم (Authentication function)
const signInUser = async () => {
  if (typeof __initial_auth_token !== "undefined") {
    try {
      if (!auth.currentUser) {
        await signInWithCustomToken(auth, __initial_auth_token);
      }
    } catch (e) {
      console.error(
        "Custom token sign-in failed, falling back to anonymous:",
        e
      );
      await signInAnonymously(auth);
    }
  } else {
    await signInAnonymously(auth);
  }
};

// --- الترجمة العربية والإنجليزية ---
const t = {
  ar: {
    appTitle: "MedTrac - سجل المتابعة الطبي",
    lang: "English",
    loginBtn: "تسجيل الدخول",
    registerBtn: "إنشاء حساب جديد",
    email: "البريد الإلكتروني",
    pass: "كلمة المرور",
    login: "دخول",
    register: "تسجيل",
    patientName: "اسم المريض",
    addPatient: "إضافة مريض جديد",
    search: "بحث بالاسم أو الكود...",
    noPatients: "لا يوجد مرضى حالياً.",
    activePatients: "المرضى الفعّالون",
    pending: "قيد المراجعة",
    pendingAccount: "حسابك قيد المراجعة. يرجى الانتظار لتفعيل المدير له.",
    adminDashboard: "لوحة تحكم المدير",
    pendingDoctors: "الأطباء الجدد بانتظار التفعيل",
    activate: "تفعيل",
    delete: "حذف",
    confirmActivate: "هل أنت متأكد من تفعيل حساب هذا الطبيب؟",
    confirmDelete: "هل أنت متأكد من حذف هذا الحساب؟",
    adminRole: "المدير",
    doctorRole: "طبيب",
    logout: "تسجيل الخروج",
    pendingRole: "معلق",
    college: "الكلية الطبية",
    seniority: "الدرجة الوظيفية",
    junior: "جونيور",
    mid: "ميد سينيور",
    senior: "سينيور",
    personalHistory: "السجل الشخصي وعوامل الخطورة",
    examination: "فحص القراءات والقياسات",
    investigations: "التحاليل والأشعة",
    presentation: "شكوى المريض الحالية (Presentation)",
    riskFactors: "عوامل الخطورة (Risk Factors)",
    hypertension: "ضغط دم مرتفع",
    diabetes: "سكري",
    af: "رجفان أذيني (AF)",
    ischemicHeart: "مرض القلب الإقفاري",
    pastStroke: "سكتة دماغية سابقة",
    regularOnTtt: "منتظم على العلاج",
    renal: "مشاكل كلوية",
    hepatic: "مشاكل كبدية",
    smoker: "مدخن",
    addict: "إدمان/تعاطي",
    bp: "ضغط الدم (BP)",
    rbs: "سكر عشوائي (RBS)",
    ipp: "القوة العضلية (Power)",
    consciousLevel: "مستوى الوعي",
    laboratory: "التحاليل المخبرية (Laboratory)",
    cbc: "تعداد الدم الكامل (CBC)",
    creat: "كرياتينين (Creat)",
    urea: "يوريا",
    pt: "زمن البروثرومبين (PT)",
    na: "صوديوم (Na)",
    k: "بوتاسيوم (K)",
    ca: "كالسيوم (Ca)",
    uricAcid: "حمض البوليك",
    hba1c: "سكر تراكمي (HbA1c)",
    toxo: "السمية (Toxo)",
    urineAnalysis: "تحليل البول",
    csf: "سائل النخاع الشوكي (CSF)",
    autoimmuneStudies: "دراسات المناعة الذاتية",
    imaging: "الأشعة والفحوصات (Imaging)",
    ct: "أشعة مقطعية (CT)",
    mri: "رنين مغناطيسي (MRI)",
    ncs: "توصيل عصبي (NCS)",
    eeg: "تخطيط الدماغ (EEG)",
    emg: "تخطيط العضلات (EMG)",
    vep: "كمونات محرضة (VEP)",
    fundusEx: "فحص قاع العين",
    value: "القيمة/النتيجة",
    note: "ملاحظات الطبيب",
    uploadImage: "إرفاق صورة (بحد أقصى 800KB)",
    image: "صورة",
    noImage: "لا توجد صورة مرفقة",
    age: "العمر",
    patientRecord: "سجل المريض",
  },
  en: {
    appTitle: "MedTrac - Medical Tracker",
    lang: "العربية",
    loginBtn: "Login",
    registerBtn: "Create New Account",
    email: "Email",
    pass: "Password",
    login: "Login",
    register: "Register",
    patientName: "Patient Name",
    addPatient: "Add New Patient",
    search: "Search by Name or Code...",
    noPatients: "No patients currently available.",
    activePatients: "Active Patients",
    pending: "Pending",
    pendingAccount:
      "Your account is pending review. Please wait for the administrator to activate it.",
    adminDashboard: "Admin Dashboard",
    pendingDoctors: "New Doctors Awaiting Activation",
    activate: "Activate",
    delete: "Delete",
    confirmActivate: "Are you sure you want to activate this doctor's account?",
    confirmDelete: "Are you sure you want to delete this account?",
    adminRole: "Admin",
    doctorRole: "Doctor",
    logout: "Logout",
    pendingRole: "Pending",
    college: "Medical College",
    seniority: "Seniority Level",
    junior: "Junior",
    mid: "Mid Senior",
    senior: "Senior",
    personalHistory: "Personal History & Risk Factors",
    examination: "Measurements & Examination",
    investigations: "Labs & Imaging",
    presentation: "Current Presentation",
    riskFactors: "Risk Factors",
    hypertension: "Hypertension",
    diabetes: "Diabetes",
    af: "Atrial Fibrillation (AF)",
    ischemicHeart: "Ischemic Heart Disease",
    pastStroke: "Past Stroke",
    regularOnTtt: "Regular on Treatment",
    renal: "Renal Problems",
    hepatic: "Hepatic Problems",
    smoker: "Smoker",
    addict: "Addict",
    bp: "Blood Pressure (BP)",
    rbs: "Random Blood Sugar (RBS)",
    ipp: "Muscle Power",
    consciousLevel: "Conscious Level",
    laboratory: "Laboratory Tests",
    cbc: "Complete Blood Count (CBC)",
    creat: "Creatinine (Creat)",
    urea: "Urea",
    pt: "Prothrombin Time (PT)",
    na: "Sodium (Na)",
    k: "Potassium (K)",
    ca: "Calcium (Ca)",
    uricAcid: "Uric Acid",
    hba1c: "HbA1c",
    toxo: "Toxo",
    urineAnalysis: "Urine Analysis",
    csf: "CSF",
    autoimmuneStudies: "Autoimmune Studies",
    imaging: "Imaging and Diagnostics",
    ct: "CT Scan",
    mri: "MRI",
    ncs: "Nerve Conduction Study (NCS)",
    eeg: "Electroencephalogram (EEG)",
    emg: "Electromyography (EMG)",
    vep: "Visual Evoked Potential (VEP)",
    fundusEx: "Fundus Examination",
    value: "Value/Result",
    note: "Doctor's Note",
    uploadImage: "Attach Image (Max 800KB)",
    image: "Image",
    noImage: "No image attached",
  },
};

// --- الأيقونات ---
const Icons = {
  Menu: (props) => (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  ),
  Activity: (props) => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    </svg>
  ),
  Users: (props) => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  ),
  UserPlus: (props) => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
      />
    </svg>
  ),
  LogOut: (props) => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
      />
    </svg>
  ),
  Check: (props) => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      {...props}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  X: (props) => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      {...props}
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  ),
  Search: (props) => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      {...props}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  ),
  Sun: (props) => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  ),
  Moon: (props) => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  ),
  Plus: (props) => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4v16m8-8H4"
      />
    </svg>
  ),
  Back: (props) => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 19l-7-7m0 0l7-7m-7 7h18"
      />
    </svg>
  ),
  Upload: (props) => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
      />
    </svg>
  ),
};

// 1. شاشة لوحة تحكم المدير (Admin Dashboard)
const AdminDashboard = ({ lang, dark, userId, setRole, txt, appId }) => {
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState(null);

  const doctorsColRef = collection(
    db,
    `artifacts/${appId}/public/data/doctors`
  );

  useEffect(() => {
    const q = query(doctorsColRef, where("role", "==", "admin")); // فقط لتعريف المدير
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const doctors = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // بما أننا ألغينا التفعيل، هذه الشاشة لن تعرض بيانات pending
        setLoading(false);
      },
      (error) => {
        console.error("Error reading doctors:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // بما أننا ألغينا نظام التفعيل، هذا المكون سيعرض رسالة بسيطة فقط
  return (
    <div className="p-4 md:p-8">
      <h1
        className={`text-3xl font-bold mb-6 ${
          dark ? "text-white" : "text-slate-800"
        }`}
      >
        {txt.adminDashboard}
      </h1>
      <div
        className={`p-6 rounded-xl border-2 border-dashed ${
          dark
            ? "border-slate-700 text-slate-400"
            : "border-gray-200 text-gray-500"
        }`}
      >
        {lang === "ar"
          ? "تم تعطيل نظام تفعيل الأطباء. يمكن للمدير استخدام لوحة المرضى مباشرة."
          : "Doctor activation system is currently disabled. Admin can use the main patient dashboard."}
      </div>
    </div>
  );
};

// 2. شاشة إدارة المرضى (Doctors Dashboard)
const DoctorsDashboard = ({ lang, dark, userId, txt, appId }) => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const patientsColRef = useMemo(
    () => collection(db, `artifacts/${appId}/users/${userId}/patients`),
    [userId]
  );

  useEffect(() => {
    const q = query(patientsColRef, orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const patientList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPatients(patientList);
        setLoading(false);
      },
      (error) => {
        console.error("Error reading patients:", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [patientsColRef]);

  const handleDeletePatient = async (id) => {
    if (window.confirm(txt.confirmDelete)) {
      try {
        await deleteDoc(doc(patientsColRef, id));
        setSelectedPatient(null);
      } catch (e) {
        alert(lang === "ar" ? "حدث خطأ أثناء الحذف." : "Deletion error.");
      }
    }
  };

  const filteredPatients = patients.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.id?.toLowerCase().includes(search.toLowerCase())
  );

  if (selectedPatient) {
    return (
      <PatientDetails
        patient={selectedPatient}
        onBack={() => setSelectedPatient(null)}
        onDelete={handleDeletePatient}
        patientsColRef={patientsColRef}
        lang={lang}
        dark={dark}
        txt={txt}
      />
    );
  }

  return (
    <div className="p-4 md:p-8">
      <h1
        className={`text-3xl font-bold mb-6 ${
          dark ? "text-white" : "text-slate-800"
        }`}
      >
        {txt.activePatients}
      </h1>
      <PatientAddForm
        patientsColRef={patientsColRef}
        lang={lang}
        dark={dark}
        txt={txt}
      />

      <div
        className={`mb-6 relative ${dark ? "text-white" : "text-slate-800"}`}
        dir={lang === "ar" ? "rtl" : "ltr"}
      >
        <input
          className={`w-full p-3 border rounded-lg outline-none ${
            dark ? "bg-slate-700 border-slate-600 text-white" : "bg-white"
          } ${lang === "ar" ? "pr-10" : "pl-10"}`}
          placeholder={txt.search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Icons.Search
          className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 ${
            lang === "ar" ? "right-3" : "left-3"
          } ${dark ? "text-slate-400" : "text-gray-500"}`}
        />
      </div>

      {loading ? (
        <p className={dark ? "text-slate-400" : "text-gray-600"}>
          {lang === "ar" ? "جاري تحميل المرضى..." : "Loading patients..."}
        </p>
      ) : filteredPatients.length === 0 ? (
        <div
          className={`p-6 rounded-xl border-2 border-dashed ${
            dark
              ? "border-slate-700 text-slate-400"
              : "border-gray-200 text-gray-500"
          }`}
        >
          {txt.noPatients}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPatients.map((patient) => (
            <div
              key={patient.id}
              onClick={() => setSelectedPatient(patient)}
              className={`p-4 rounded-xl shadow-md flex justify-between items-center cursor-pointer hover:shadow-lg transition-shadow ${
                dark ? "bg-slate-800" : "bg-white"
              }`}
            >
              <div>
                <p
                  className={`font-bold ${
                    dark ? "text-white" : "text-slate-800"
                  }`}
                >
                  {patient.name}
                </p>
                <p
                  className={`text-sm ${
                    dark ? "text-slate-400" : "text-gray-500"
                  }`}
                >
                  {patient.id}
                </p>
              </div>
              <button className="bg-blue-500 text-white py-2 px-4 rounded-lg font-bold hover:bg-blue-600 transition-colors">
                {lang === "ar" ? "عرض السجل" : "View Record"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 2.1: نموذج إضافة مريض
const PatientAddForm = ({ patientsColRef, lang, dark, txt }) => {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [riskFactors, setRiskFactors] = useState({});
  const formRef = useRef(null);

  const RISKS = [
    "hypertension",
    "diabetes",
    "af",
    "ischemicHeart",
    "pastStroke",
    "regularOnTtt",
    "renal",
    "hepatic",
    "smoker",
    "addict",
  ];

  const handleRiskChange = (key) => {
    setRiskFactors((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const patientId = `P-${Date.now().toString().slice(-6)}`;

    try {
      const formData = new FormData(formRef.current);

      // جمع بيانات الفحص
      const examinationData = {};
      ["bp", "rbs", "ipp", "consciousLevel"].forEach((key) => {
        examinationData[key] = formData.get(key) || "";
      });

      await setDoc(doc(patientsColRef, patientId), {
        id: patientId,
        name: name,
        age: age,
        createdAt: serverTimestamp(),

        // Personal History
        presentation: formData.get("presentation") || "",
        riskFactors: riskFactors,

        // Examination
        examination: examinationData,

        // Investigations (Initial empty state)
        investigations: {
          laboratory: [],
          imaging: [],
        },
      });

      // إعادة ضبط الحقول
      setName("");
      setAge("");
      setRiskFactors({});
      formRef.current.reset();
      alert(txt.addPatient + " " + (lang === "ar" ? "بنجاح!" : "Successful!"));
    } catch (e) {
      console.error("Error adding patient:", e);
      alert("حدث خطأ أثناء إضافة المريض.");
    }
  };

  const Input = ({
    name,
    placeholder,
    value,
    onChange,
    type = "text",
    required = true,
  }) => (
    <input
      name={name}
      type={type}
      className={`w-full p-3 border rounded-lg outline-none ${
        dark ? "bg-slate-700 border-slate-600 text-white" : "bg-gray-50"
      }`}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
    />
  );

  const Divider = ({ title }) => (
    <h3
      className={`text-lg font-bold pt-4 pb-2 border-b mt-6 ${
        dark
          ? "border-slate-700 text-blue-400"
          : "border-gray-200 text-blue-600"
      }`}
    >
      {title}
    </h3>
  );

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className={`mb-6 p-6 rounded-2xl shadow-lg space-y-4 ${
        dark ? "bg-slate-800" : "bg-white"
      }`}
    >
      <h2
        className={`text-2xl font-bold ${
          dark ? "text-white" : "text-slate-800"
        }`}
      >
        {txt.addPatient}
      </h2>

      {/* Name & Age */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          name="name"
          placeholder={txt.patientName}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          name="age"
          placeholder={txt.age}
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.value)}
        />
      </div>

      {/* --- 1. PERSONAL HISTORY --- */}
      <Divider title={txt.personalHistory} />

      {/* Presentation */}
      <textarea
        name="presentation"
        rows="3"
        className={`w-full p-3 border rounded-lg outline-none ${
          dark ? "bg-slate-700 border-slate-600 text-white" : "bg-gray-50"
        }`}
        placeholder={txt.presentation}
        required
      ></textarea>

      {/* Risk Factors Checkboxes */}
      <h4
        className={`text-sm font-semibold mt-4 ${
          dark ? "text-slate-300" : "text-gray-600"
        }`}
      >
        {txt.riskFactors}:
      </h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-3 rounded-lg border border-dashed">
        {RISKS.map((key) => (
          <label
            key={key}
            className={`flex items-center space-x-2 cursor-pointer ${
              dark ? "text-slate-300" : "text-slate-700"
            }`}
            dir={lang === "ar" ? "rtl" : "ltr"}
          >
            <input
              type="checkbox"
              checked={riskFactors[key] || false}
              onChange={() => handleRiskChange(key)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm">{txt[key]}</span>
          </label>
        ))}
      </div>

      {/* --- 2. EXAMINATION --- */}
      <Divider title={txt.examination} />
      <div className="grid grid-cols-2 gap-4">
        <Input name="bp" placeholder={txt.bp} required={false} />
        <Input name="rbs" placeholder={txt.rbs} required={false} />
        <Input name="ipp" placeholder={txt.ipp} required={false} />
        <Input
          name="consciousLevel"
          placeholder={txt.consciousLevel}
          required={false}
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors mt-6"
      >
        {txt.addPatient}
      </button>
    </form>
  );
};

// 2.2: صفحة تفاصيل المريض (Patient Details)
const PatientDetails = ({
  patient,
  onBack,
  onDelete,
  patientsColRef,
  lang,
  dark,
  txt,
}) => {
  const [currentPatient, setCurrentPatient] = useState(patient);
  const [activeTab, setActiveTab] = useState("history");
  const [invType, setInvType] = useState("lab"); // lab or img
  const [inputData, setInputData] = useState({ value: "", note: "" });
  const fileRef = useRef(null);

  // تحديث بيانات المريض في الوقت الفعلي
  useEffect(() => {
    const docRef = doc(patientsColRef, patient.id);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setCurrentPatient(docSnap.data());
      }
    });
    return () => unsubscribe();
  }, [patient.id, patientsColRef]);

  // لغة الإنجليزية للمفاتيح
  const LAB_KEYS = [
    "cbc",
    "creat",
    "urea",
    "pt",
    "na",
    "k",
    "ca",
    "uricAcid",
    "hba1c",
    "toxo",
    "urineAnalysis",
    "csf",
    "autoimmuneStudies",
  ];
  const IMG_KEYS = ["ct", "mri", "ncs", "eeg", "emg", "vep", "fundusEx"];

  // دالة تحويل الصورة إلى Base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      if (file.size > 800 * 1024) {
        // 800KB Limit
        reject(
          new Error(
            lang === "ar"
              ? "حجم الملف يتجاوز 800KB."
              : "File size exceeds 800KB limit."
          )
        );
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // دالة إضافة سجل جديد (لـ LAB / IMG)
  const handleAddInvestigation = async (key) => {
    const file = fileRef.current?.files[0];
    let base64Image = "";

    if (file) {
      try {
        base64Image = await fileToBase64(file);
      } catch (e) {
        alert(
          lang === "ar"
            ? `خطأ في الصورة: ${e.message}`
            : `Image Error: ${e.message}`
        );
        return;
      }
    }

    const newRecord = {
      key: key,
      value: inputData.value || "",
      note: inputData.note || "",
      image: base64Image,
      date: new Date().toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US"),
      timestamp: serverTimestamp(),
    };

    const targetType = activeTab === "lab" ? "laboratory" : "imaging";

    try {
      const docRef = doc(patientsColRef, currentPatient.id);
      // تحديث الحقل المحدد (laboratory أو imaging) باستخدام arrayUnion
      await updateDoc(docRef, {
        [`investigations.${targetType}`]: arrayUnion(newRecord),
      });

      // إعادة ضبط الحقول
      setInputData({ value: "", note: "" });
      if (fileRef.current) fileRef.current.value = "";
      alert(
        lang === "ar" ? "تم إضافة السجل بنجاح!" : "Record added successfully!"
      );
    } catch (e) {
      console.error("Error adding investigation:", e);
      alert(
        lang === "ar" ? "حدث خطأ أثناء إضافة السجل." : "Error adding record."
      );
    }
  };

  // دالة عرض سجلات التحاليل/الأشعة
  const renderRecords = (data) => {
    if (!data || data.length === 0) {
      return (
        <p
          className={`p-4 text-center ${
            dark ? "text-slate-400" : "text-gray-500"
          }`}
        >
          {txt.noRecords}
        </p>
      );
    }

    return (
      <div className="space-y-4">
        {data
          .slice()
          .reverse()
          .map((record, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border ${
                dark
                  ? "bg-slate-700 border-slate-600"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-lg text-blue-500">
                  {txt[record.key]}
                </span>
                <span className="text-xs text-gray-500">{record.date}</span>
              </div>
              {record.value && (
                <p className="mb-2">
                  <strong>{txt.value}:</strong> {record.value}
                </p>
              )}
              {record.note && (
                <p className="mb-2">
                  <strong>{txt.note}:</strong> {record.note}
                </p>
              )}

              {record.image && (
                <div className="mt-3">
                  <strong>{txt.image}:</strong>

                  <img
                    src={record.image}
                    alt={txt[record.key]}
                    className="w-full max-h-60 object-contain rounded-lg border mt-1"
                  />
                </div>
              )}
            </div>
          ))}
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-blue-500 hover:text-blue-700 font-bold"
        >
          <Icons.Back className={lang === "ar" ? "ml-2" : "mr-2"} />{" "}
          {lang === "ar" ? "عودة للمرضى" : "Back to Patients"}
        </button>
        <button
          onClick={() => onDelete(patient.id)}
          className="text-red-500 hover:text-red-700"
        >
          {lang === "ar" ? "حذف المريض" : "Delete Patient"}
        </button>
      </div>

      <h1
        className={`text-4xl font-extrabold ${
          dark ? "text-white" : "text-slate-800"
        }`}
      >
        {currentPatient.name}
      </h1>
      <p className="text-gray-500 mb-6">
        {currentPatient.id} • {currentPatient.age}{" "}
        {lang === "ar" ? "سنة" : "Years Old"}
      </p>

      {/* --- TABS --- */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <button
          onClick={() => setActiveTab("history")}
          className={`p-3 rounded-t-lg font-bold transition-colors ${
            activeTab === "history"
              ? dark
                ? "bg-blue-600 text-white"
                : "bg-blue-500 text-white"
              : dark
              ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          {txt.personalHistory}
        </button>
        <button
          onClick={() => setActiveTab("exam")}
          className={`p-3 rounded-t-lg font-bold transition-colors ${
            activeTab === "exam"
              ? dark
                ? "bg-blue-600 text-white"
                : "bg-blue-500 text-white"
              : dark
              ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          {txt.examination}
        </button>
        <button
          onClick={() => setActiveTab("invest")}
          className={`p-3 rounded-t-lg font-bold transition-colors ${
            activeTab === "invest"
              ? dark
                ? "bg-blue-600 text-white"
                : "bg-blue-500 text-white"
              : dark
              ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          {txt.investigations}
        </button>
      </div>

      {/* --- TAB CONTENT --- */}
      <div
        className={`p-6 rounded-b-xl shadow-lg ${
          dark ? "bg-slate-800" : "bg-white"
        }`}
      >
        {/* PERSONAL HISTORY TAB */}
        {activeTab === "history" && (
          <div className="space-y-4">
            <h3
              className={`text-xl font-bold ${
                dark ? "text-blue-400" : "text-blue-600"
              }`}
            >
              {txt.presentation}
            </h3>
            <p
              className={`p-3 rounded-lg border ${
                dark
                  ? "bg-slate-700 border-slate-600"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              {currentPatient.presentation ||
                (lang === "ar"
                  ? "لا توجد شكوى مسجلة"
                  : "No presentation recorded")}
            </p>

            <h3
              className={`text-xl font-bold pt-4 ${
                dark ? "text-blue-400" : "text-blue-600"
              }`}
            >
              {txt.riskFactors}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                "hypertension",
                "diabetes",
                "af",
                "ischemicHeart",
                "pastStroke",
                "regularOnTtt",
                "renal",
                "hepatic",
                "smoker",
                "addict",
              ].map((key) => (
                <div
                  key={key}
                  className={`flex items-center space-x-2 ${
                    currentPatient.riskFactors?.[key]
                      ? "text-green-500 font-bold"
                      : "text-red-500 opacity-70 line-through"
                  }`}
                  dir="rtl"
                >
                  {currentPatient.riskFactors?.[key] ? (
                    <Icons.Check className="w-5 h-5" />
                  ) : (
                    <Icons.X className="w-5 h-5" />
                  )}
                  <span>{txt[key]}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EXAMINATION TAB */}
        {activeTab === "exam" && (
          <div className="space-y-4">
            {Object.entries(currentPatient.examination || {}).map(
              ([key, value]) => (
                <div
                  key={key}
                  className={`p-3 rounded-lg border ${
                    dark
                      ? "bg-slate-700 border-slate-600"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <strong className="text-blue-500">{txt[key]}:</strong>{" "}
                  {value || (lang === "ar" ? "غير مسجل" : "Not recorded")}
                </div>
              )
            )}
          </div>
        )}

        {/* INVESTIGATIONS TAB */}
        {activeTab === "invest" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 1. ADD NEW INVESTIGATION */}
            <div
              className={`lg:col-span-1 p-4 rounded-xl h-fit border ${
                dark
                  ? "bg-slate-700 border-slate-600"
                  : "bg-gray-100 border-gray-200"
              }`}
            >
              <h4 className="font-bold mb-3">
                {lang === "ar" ? "إضافة فحص جديد" : "Add New Test"}
              </h4>
              <div className="flex space-x-2 mb-3">
                <button
                  type="button"
                  onClick={() => setInvType("lab")}
                  className={`flex-1 py-2 rounded-lg font-bold transition-colors ${
                    invType === "lab"
                      ? "bg-blue-500 text-white"
                      : dark
                      ? "bg-slate-600 text-slate-300"
                      : "bg-white text-gray-700"
                  }`}
                >
                  {lang === "ar" ? "تحاليل" : "Labs"}
                </button>
                <button
                  type="button"
                  onClick={() => setInvType("img")}
                  className={`flex-1 py-2 rounded-lg font-bold transition-colors ${
                    invType === "img"
                      ? "bg-blue-500 text-white"
                      : dark
                      ? "bg-slate-600 text-slate-300"
                      : "bg-white text-gray-700"
                  }`}
                >
                  {lang === "ar" ? "أشعة" : "Imaging"}
                </button>
              </div>

              <select
                name="testKey"
                onChange={(e) =>
                  setInputData({ ...inputData, key: e.target.value })
                }
                value={
                  inputData.key ||
                  (invType === "lab" ? LAB_KEYS[0] : IMG_KEYS[0])
                }
                className={`w-full p-2 mb-3 rounded-lg border ${
                  dark
                    ? "bg-slate-800 border-slate-600 text-white"
                    : "bg-white text-slate-800"
                }`}
              >
                {(invType === "lab" ? LAB_KEYS : IMG_KEYS).map((key) => (
                  <option key={key} value={key}>
                    {txt[key]}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder={txt.value}
                value={inputData.value}
                onChange={(e) =>
                  setInputData({ ...inputData, value: e.target.value })
                }
                className={`w-full p-2 mb-3 rounded-lg border ${
                  dark
                    ? "bg-slate-800 border-slate-600 text-white"
                    : "bg-white text-slate-800"
                }`}
              />
              <textarea
                placeholder={txt.note}
                rows="2"
                value={inputData.note}
                onChange={(e) =>
                  setInputData({ ...inputData, note: e.target.value })
                }
                className={`w-full p-2 mb-3 rounded-lg border ${
                  dark
                    ? "bg-slate-800 border-slate-600 text-white"
                    : "bg-white text-slate-800"
                }`}
              />

              <label
                className={`flex items-center justify-center p-2 rounded-lg border cursor-pointer text-sm ${
                  dark
                    ? "bg-slate-600 border-slate-500 hover:bg-slate-500"
                    : "bg-blue-100 border-blue-200 hover:bg-blue-200"
                }`}
              >
                <Icons.Upload className="w-4 h-4" />
                <span className={lang === "ar" ? "mr-2" : "ml-2"}>
                  {txt.uploadImage}
                </span>
                <input
                  type="file"
                  ref={fileRef}
                  className="hidden"
                  accept="image/*"
                />
              </label>

              <button
                onClick={handleAddInvestigation}
                className="w-full bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition-colors mt-3"
              >
                {txt.save}
              </button>
            </div>

            {/* 2. RECORDS LIST */}
            <div className="lg:col-span-2 space-y-6">
              <h3
                className={`text-xl font-bold ${
                  dark ? "text-blue-400" : "text-blue-600"
                }`}
              >
                {txt.laboratory}
              </h3>
              {renderRecords(currentPatient.investigations?.laboratory)}

              <h3
                className={`text-xl font-bold pt-4 border-t ${
                  dark
                    ? "text-blue-400 border-slate-700"
                    : "text-blue-600 border-gray-200"
                }`}
              >
                {txt.imaging}
              </h3>
              {renderRecords(currentPatient.investigations?.imaging)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 3. شاشة انتظار التفعيل (Pending Screen)
const PendingScreen = ({ lang, dark, txt }) => {
  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
        dark ? "bg-slate-900" : "bg-slate-50"
      }`}
    >
      <div
        className={`p-8 rounded-2xl shadow-lg w-full max-w-md border text-center ${
          dark
            ? "bg-slate-800 border-slate-700 text-white"
            : "bg-white border-gray-100 text-slate-800"
        }`}
      >
        <div className="inline-flex p-3 bg-yellow-500 text-white rounded-xl mb-3">
          <Icons.Activity className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold mb-4">{txt.pending}</h1>
        <p className="mb-6">{txt.pendingAccount}</p>
        <button
          onClick={() => signOut(auth)}
          className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-all"
        >
          {txt.logout}
        </button>
      </div>
    </div>
  );
};

// 4. شاشة الدخول والتسجيل (Auth Screen)
const AuthScreen = ({ lang, setLang, dark, setDark, setAppRole }) => {
  const [isReg, setReg] = useState(false); // تبديل بين التسجيل والدخول
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

        // التحقق مما إذا كان هذا هو أول مستخدم يسجل
        const adminInitRef = doc(doctorsColRef, "admin_init");
        const adminInitSnap = await getDoc(adminInitRef);

        let initialRole = "pending";
        // إذا لم يكن هناك مدير، فاجعل أول مستخدم هو المدير
        if (!adminInitSnap.exists()) {
          initialRole = "admin";
          await setDoc(adminInitRef, {
            initialized: true,
            userId: user.uid,
            email: user.email,
            createdAt: serverTimestamp(),
          });
        }

        // إنشاء ملف الطبيب في Firestore
        await setDoc(userRef, {
          email: user.email,
          role: initialRole, // admin أو pending
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
      // رسالة خطأ موحدة لأسباب أمنية
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

// 5. مكون شريط التنقل
const Sidebar = ({ lang, dark, role, setScreen, txt }) => {
  const getRoleText = (r) => {
    if (r === "admin") return txt.adminRole;
    if (r === "doctor") return txt.doctorRole;
    return txt.pendingRole;
  };

  const navItems = [
    {
      label: txt.activePatients,
      screen: "dashboard",
      icon: Icons.Users,
      show: role === "doctor" || role === "admin", // المديرين يمكنهم أيضاً رؤية المرضى
    },
    {
      label: txt.adminDashboard,
      screen: "admin",
      icon: Icons.UserPlus,
      show: role === "admin",
    },
  ].filter((item) => item.show);

  return (
    <div
      className={`h-screen w-64 flex-shrink-0 p-4 border-r transition-colors duration-300 hidden md:flex flex-col ${
        dark
          ? "bg-slate-800 border-slate-700 text-white"
          : "bg-white border-gray-200 text-slate-800"
      }`}
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <div className="flex items-center space-x-2 pb-4 border-b border-dashed mb-6">
        <div className="inline-flex p-2 bg-blue-600 text-white rounded-lg">
          <Icons.Activity className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold">{txt.appTitle}</h2>
      </div>

      <p
        className={`mb-4 text-sm font-semibold ${
          dark ? "text-slate-400" : "text-gray-600"
        }`}
      >
        {lang === "ar" ? "دورك:" : "Your Role:"} {getRoleText(role)}
      </p>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <button
            key={item.screen}
            onClick={() => setScreen(item.screen)}
            className={`w-full flex items-center p-3 rounded-lg font-medium transition-colors ${
              dark
                ? "text-slate-200 hover:bg-slate-700"
                : "text-slate-700 hover:bg-gray-100"
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className={lang === "ar" ? "mr-3" : "ml-3"}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-4 border-t border-dashed">
        <button
          onClick={() => signOut(auth)}
          className={`w-full flex items-center p-3 rounded-lg font-medium transition-colors ${
            dark
              ? "text-red-400 hover:bg-slate-700"
              : "text-red-600 hover:bg-red-50"
          }`}
        >
          <Icons.LogOut className="w-5 h-5" />
          <span className={lang === "ar" ? "mr-3" : "ml-3"}>{txt.logout}</span>
        </button>
      </div>
    </div>
  );
};

// 6. المكون الرئيسي
export const App = () => {
  const [lang, setLang] = useState("ar");
  const [dark, setDark] = useState(false);
  const [user, setUser] = useState(null); // Firebase Auth User
  const [role, setRole] = useState(null); // admin, doctor, pending, null
  const [screen, setScreen] = useState("dashboard"); // dashboard or admin
  const txt = t[lang];

  // 1. إدارة حالة التوثيق والدور
  useEffect(() => {
    // محاولة تسجيل الدخول بالرمز المخصص
    signInUser();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // جلب دور المستخدم من Firestore
        const userDocRef = doc(
          db,
          `artifacts/${appId}/public/data/doctors`,
          currentUser.uid
        );

        // نستخدم onSnapshot لمتابعة التغييرات في دور المستخدم (مثل التفعيل)
        const unsubscribeFirestore = onSnapshot(
          userDocRef,
          (docSnap) => {
            if (docSnap.exists()) {
              const userData = docSnap.data();
              setRole(userData.role);
              // تحديد الشاشة المناسبة بناءً على الدور الحالي
              if (userData.role === "doctor") setScreen("dashboard");
              if (userData.role === "admin") setScreen("admin");
              if (userData.role === "pending") setScreen("pending");
            } else {
              // إذا كان المستخدم موثقاً لكن لا يوجد له مستند دور في Firestore (خطأ في التسجيل)
              setRole("pending");
              setScreen("pending");
            }
          },
          (error) => {
            // التعامل مع أخطاء القراءة (مثلاً: قواعد الأمان)
            console.error("Error reading doctor document:", error);
            setRole(null);
          }
        );

        return () => unsubscribeFirestore();
      } else {
        // إذا لم يكن هناك مستخدم موثق
        setUser(null);
        setRole(null);
        setScreen("dashboard");
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. دالة عرض الشاشة المناسبة
  const renderScreen = () => {
    if (!user || role === null) {
      // شاشة الدخول إذا لم يكن هناك مستخدم موثق أو في حالة التحميل الأولي
      return (
        <AuthScreen
          lang={lang}
          setLang={setLang}
          dark={dark}
          setDark={setDark}
          setAppRole={setRole}
        />
      );
    }

    if (role === "pending") {
      // شاشة انتظار التفعيل
      return <PendingScreen lang={lang} dark={dark} txt={txt} />;
    }

    // الشاشات الرئيسية (Admin, Doctor)
    if (role === "admin" && screen === "admin") {
      return (
        <AdminDashboard
          lang={lang}
          dark={dark}
          userId={user.uid}
          setRole={setRole}
          txt={txt}
        />
      );
    }

    // شاشة الأطباء الافتراضية
    if (screen === "dashboard" || role === "doctor" || role === "admin") {
      return (
        <DoctorsDashboard lang={lang} dark={dark} userId={user.uid} txt={txt} />
      );
    }

    // في حالة عدم تطابق أي شيء (لحالات استثنائية)
    return (
      <div className="p-4">
        {lang === "ar" ? "خطأ في عرض الشاشة." : "Screen render error."}
      </div>
    );
  };

  return (
    <div
      className={`min-h-screen flex w-full ${
        dark ? "bg-slate-900" : "bg-slate-50"
      }`}
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      {/* شريط التنقل للموبايل (Header) */}
      <div
        className={`md:hidden p-4 flex justify-between items-center shadow-sm sticky top-0 z-30 w-full ${
          dark ? "bg-slate-800 text-white" : "bg-white text-slate-800"
        }`}
      >
        <div className="flex items-center gap-2 font-bold">
          <Icons.Activity className="w-5 h-5" /> {txt.appTitle}
        </div>
        {/* زر القائمة سيظهر فقط إذا كان المستخدم مفعّل */}
        {(role === "admin" || role === "doctor") && (
          <button
            onClick={() =>
              setScreen(screen === "mobile-menu" ? "dashboard" : "mobile-menu")
            }
          >
            <Icons.Menu className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Sidebar للمساحات الكبيرة */}
      <Sidebar
        lang={lang}
        dark={dark}
        role={role}
        setScreen={setScreen}
        txt={txt}
      />

      {/* قائمة الموبايل المنبثقة (Overlay) */}
      {(role === "admin" || role === "doctor") && screen === "mobile-menu" && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setScreen("dashboard")}
        >
          <div
            className={`w-3/4 h-full p-4 absolute right-0 transition-transform duration-300 ${
              dark ? "bg-slate-800" : "bg-white"
            }`}
          >
            {/* Nav Items - Mobile Menu */}

            <button
              onClick={() => {
                setScreen("dashboard");
              }}
              className={`w-full flex items-center p-3 rounded-lg font-medium transition-colors ${
                dark
                  ? "text-slate-200 hover:bg-slate-700"
                  : "text-slate-700 hover:bg-gray-100"
              }`}
            >
              <Icons.Users className="w-5 h-5" />
              <span className={lang === "ar" ? "mr-3" : "ml-3"}>
                {txt.activePatients}
              </span>
            </button>
            {role === "admin" && (
              <button
                onClick={() => {
                  setScreen("admin");
                }}
                className={`w-full flex items-center p-3 rounded-lg font-medium transition-colors ${
                  dark
                    ? "text-slate-200 hover:bg-slate-700"
                    : "text-slate-700 hover:bg-gray-100"
                }`}
              >
                <Icons.UserPlus className="w-5 h-5" />
                <span className={lang === "ar" ? "mr-3" : "ml-3"}>
                  {txt.adminDashboard}
                </span>
              </button>
            )}
            <div className="mt-8 pt-4 border-t border-dashed">
              <button
                onClick={() => signOut(auth)}
                className={`w-full flex items-center p-3 rounded-lg font-medium transition-colors ${
                  dark
                    ? "text-red-400 hover:bg-slate-700"
                    : "text-red-600 hover:bg-red-50"
                }`}
              >
                <Icons.LogOut className="w-5 h-5" />
                <span className={lang === "ar" ? "mr-3" : "ml-3"}>
                  {txt.logout}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto">{renderScreen()}</main>
    </div>
  );
};

export default App;
