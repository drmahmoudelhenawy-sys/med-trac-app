import React, { useState, useEffect, useMemo } from "react";
// استيراد أدوات Firebase
import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
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
} from "firebase/firestore";

// استيراد الأيقونات
const Icons = {
  Activity: (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  ),
  Home: (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  Users: (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  UserPlus: (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" x2="19" y1="8" y2="14" />
      <line x1="16" x2="22" y1="11" y2="11" />
    </svg>
  ),
  LogOut: (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  ),
  Plus: (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  ),
  Search: (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  ),
  Check: (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  X: (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  ),
};

// --- إعدادات Firebase العامة ---
// يجب تعريف هذه المتغيرات في البيئة (Canvas Environment)
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
      await auth.currentUser;
    } catch (e) {
      await signInWithCustomToken(auth, __initial_auth_token);
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
    login: "تسجيل الدخول",
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
  },
};

// --- مكونات شاشات التطبيق ---

// 1. شاشة لوحة تحكم المدير (Admin Dashboard)
const AdminDashboard = ({ lang, dark, userId, setRole, txt }) => {
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState(null); // { type: 'activate'/'delete', docId: '...' }

  const doctorsColRef = collection(
    db,
    `artifacts/${appId}/public/data/doctors`
  );

  useEffect(() => {
    // جلب الأطباء المعلقين (Pending) فقط
    const q = query(doctorsColRef, where("role", "==", "pending"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const doctors = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPendingDoctors(doctors);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const handleAction = async (docId, action) => {
    try {
      const doctorRef = doc(doctorsColRef, docId);
      if (action === "activate") {
        await updateDoc(doctorRef, { role: "doctor", isActive: true });
        // إذا كان الطبيب المفعّل هو المدير نفسه، حدث الدور محلياً
        if (docId === userId) setRole("doctor");
      } else if (action === "delete") {
        await deleteDoc(doctorRef);
        // لا يمكن للمدير حذف نفسه من هذه الشاشة
      }
      setConfirmModal(null);
    } catch (e) {
      console.error("Error performing action:", e);
      alert("حدث خطأ أثناء تنفيذ الإجراء.");
    }
  };

  const Modal = () => {
    if (!confirmModal) return null;
    const { type, docId, email } = confirmModal;
    const isActivate = type === "activate";

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div
          className={`p-6 rounded-lg shadow-2xl w-full max-w-sm ${
            dark ? "bg-slate-700 text-white" : "bg-white text-slate-800"
          }`}
        >
          <h3 className="text-xl font-bold mb-4">
            {isActivate ? txt.confirmActivate : txt.confirmDelete}
          </h3>
          <p className="mb-6">
            {txt.email}: **{email}**
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setConfirmModal(null)}
              className="py-2 px-4 rounded-lg border transition-colors"
            >
              {lang === "ar" ? "إلغاء" : "Cancel"}
            </button>
            <button
              onClick={() => handleAction(docId, type)}
              className={`py-2 px-4 rounded-lg font-bold transition-colors ${
                isActivate
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-red-600 text-white hover:bg-red-700"
              }`}
            >
              {isActivate ? txt.activate : txt.delete}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading)
    return (
      <div className="text-center p-10">
        {lang === "ar" ? "جاري التحميل..." : "Loading..."}
      </div>
    );

  return (
    <div className="p-4 md:p-8">
      <h1
        className={`text-3xl font-bold mb-6 ${
          dark ? "text-white" : "text-slate-800"
        }`}
      >
        {txt.adminDashboard}
      </h1>

      <h2
        className={`text-xl font-semibold mb-4 ${
          dark ? "text-slate-300" : "text-slate-600"
        }`}
      >
        {txt.pendingDoctors} ({pendingDoctors.length})
      </h2>

      {pendingDoctors.length === 0 ? (
        <div
          className={`p-6 rounded-xl border-2 border-dashed ${
            dark
              ? "border-slate-700 text-slate-400"
              : "border-gray-200 text-gray-500"
          }`}
        >
          {lang === "ar"
            ? "لا يوجد أطباء جدد بانتظار التفعيل."
            : "No new doctors awaiting activation."}
        </div>
      ) : (
        <div className="space-y-4">
          {pendingDoctors.map((doctor) => (
            <div
              key={doctor.id}
              className={`p-4 rounded-xl shadow-md flex justify-between items-center ${
                dark ? "bg-slate-800 text-white" : "bg-white text-slate-800"
              }`}
            >
              <div>
                <p className="font-bold">{doctor.email}</p>
                <p
                  className={`text-sm ${
                    dark ? "text-slate-400" : "text-gray-500"
                  }`}
                >
                  UID: {doctor.id}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() =>
                    setConfirmModal({
                      type: "activate",
                      docId: doctor.id,
                      email: doctor.email,
                    })
                  }
                  className="p-2 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors"
                  title={txt.activate}
                >
                  <Icons.Check className="w-5 h-5" />
                </button>
                <button
                  onClick={() =>
                    setConfirmModal({
                      type: "delete",
                      docId: doctor.id,
                      email: doctor.email,
                    })
                  }
                  className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                  title={txt.delete}
                >
                  <Icons.X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal />
    </div>
  );
};

// 2. شاشة إدارة المرضى (Doctors Dashboard)
const DoctorsDashboard = ({ lang, dark, userId, txt }) => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [newPatientName, setNewPatientName] = useState("");
  const [loading, setLoading] = useState(true);

  // مسار المرضى أصبح خاص لكل طبيب
  const patientsColRef = useMemo(
    () => collection(db, `artifacts/${appId}/users/${userId}/patients`),
    [userId]
  );

  useEffect(() => {
    const q = query(patientsColRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const patientList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPatients(patientList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [patientsColRef]);

  const handleAddPatient = async (e) => {
    e.preventDefault();
    if (!newPatientName.trim()) return;

    try {
      // الكود الخاص بالمريض (Patient ID)
      const patientId = `P-${Date.now().toString().slice(-6)}`;

      await setDoc(doc(patientsColRef, patientId), {
        name: newPatientName.trim(),
        id: patientId,
        createdAt: new Date().toISOString(),
        notes: [], // سجل الملاحظات
      });

      setNewPatientName("");
    } catch (e) {
      console.error("Error adding document: ", e);
      alert("حدث خطأ أثناء إضافة المريض.");
    }
  };

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8">
      <h1
        className={`text-3xl font-bold mb-6 ${
          dark ? "text-white" : "text-slate-800"
        }`}
      >
        {txt.activePatients}
      </h1>

      {/* نموذج إضافة مريض جديد */}
      <form
        onSubmit={handleAddPatient}
        className={`mb-6 p-4 rounded-xl shadow-md flex space-x-2 ${
          dark ? "bg-slate-800" : "bg-white"
        }`}
        dir="ltr" // هذا النموذج يتم عرضه LTR لسهولة إدخال الكود
      >
        <input
          className={`w-full p-3 border rounded-lg outline-none ${
            dark ? "bg-slate-700 border-slate-600 text-white" : "bg-white"
          }`}
          placeholder={txt.patientName}
          value={newPatientName}
          onChange={(e) => setNewPatientName(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white p-3 rounded-lg font-bold flex items-center justify-center hover:bg-blue-700 transition-colors min-w-[120px]"
        >
          <Icons.Plus className="w-5 h-5" />
          <span className="ml-2">{txt.addPatient}</span>
        </button>
      </form>

      {/* شريط البحث */}
      <div
        className={`mb-6 relative ${dark ? "text-white" : "text-slate-800"}`}
      >
        <input
          className={`w-full p-3 border rounded-lg outline-none pl-10 ${
            dark ? "bg-slate-700 border-slate-600 text-white" : "bg-white"
          }`}
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

      {/* قائمة المرضى */}
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
              className={`p-4 rounded-xl shadow-md flex justify-between items-center ${
                dark ? "bg-slate-800 text-white" : "bg-white text-slate-800"
              }`}
            >
              <div>
                <p className="font-bold">{patient.name}</p>
                <p
                  className={`text-sm ${
                    dark ? "text-slate-400" : "text-gray-500"
                  }`}
                >
                  {patient.id}
                </p>
              </div>
              <button
                // هنا يمكن وضع زر للانتقال لصفحة ملاحظات المريض
                className="bg-blue-500 text-white py-2 px-4 rounded-lg font-bold hover:bg-blue-600 transition-colors"
              >
                {lang === "ar" ? "عرض السجل" : "View Record"}
              </button>
            </div>
          ))}
        </div>
      )}
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
          <Icons.Activity />
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
        const allDocs = await getDoc(doc(doctorsColRef, "admin_init"));
        const isAdminInitialized = allDocs.exists();

        let initialRole = "pending";
        // إذا لم يكن هناك مدير، فاجعل أول مستخدم هو المدير
        if (!isAdminInitialized) {
          initialRole = "admin";
          await setDoc(doc(doctorsColRef, "admin_init"), { initialized: true });
        }

        // إنشاء ملف الطبيب في Firestore
        await setDoc(userRef, {
          email: user.email,
          role: initialRole, // admin أو pending
          createdAt: new Date().toISOString(),
          // isActive لم تعد ضرورية، الدور هو المحدد
        });
      } else {
        // --- عملية تسجيل الدخول (Sign In) ---
        await signInWithEmailAndPassword(auth, email, pass);
        // التحقق من الدور سيتم في مكون App الرئيسي عبر onAuthStateChanged
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

// 5. مكون التطبيق الرئيسي (Main App Component)
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
      show: role === "doctor",
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
      className={`h-screen w-64 flex-shrink-0 p-4 border-r transition-colors duration-300 ${
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
  const [role, setRole] = useState("loading"); // admin, doctor, pending, null, loading
  const [screen, setScreen] = useState("dashboard"); // dashboard or admin
  const txt = t[lang];

  // 1. إدارة حالة التوثيق والدور
  useEffect(() => {
    signInUser(); // تسجيل دخول مبدئي بالرمز
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // جلب دور المستخدم من Firestore
        const userDocRef = doc(
          db,
          `artifacts/${appId}/public/data/doctors`,
          currentUser.uid
        );

        const unsubscribeFirestore = onSnapshot(
          userDocRef,
          (docSnap) => {
            if (docSnap.exists()) {
              const userData = docSnap.data();
              setRole(userData.role);
              // إذا كان المستخدم مفعّل، نذهب إلى شاشة لوحة التحكم الخاصة به
              if (userData.role === "doctor") setScreen("dashboard");
              if (userData.role === "admin") setScreen("admin");
              if (userData.role === "pending") setScreen("pending");
            } else {
              // هذا يحدث فقط إذا كان المستخدم مسجلاً بالرمز الأولي
              // ولكن ليس له مستند في Firestore، يتم التعامل معه كـ pending
              setRole("pending");
              setScreen("pending");
            }
          },
          (error) => {
            console.error("Error reading doctor document:", error);
            setRole(null);
          }
        );

        return () => unsubscribeFirestore(); // إلغاء الاشتراك في Firestore
      } else {
        setUser(null);
        setRole(null);
        setScreen("dashboard");
      }
    });
    return () => unsubscribe(); // إلغاء الاشتراك في Auth
  }, []);

  // 2. عرض الشاشة المناسبة
  const renderScreen = () => {
    if (!user || role === "loading") {
      // شاشة الدخول إذا لم يكن هناك مستخدم موثق أو إذا كنا ننتظر الدور
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
    return (
      <DoctorsDashboard lang={lang} dark={dark} userId={user.uid} txt={txt} />
    );
  };

  if (!user && role !== null) {
    // أثناء محاولة التحقق الأولية من المستخدم
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className={dark ? "text-white" : "text-gray-800"}>
          {lang === "ar" ? "جاري التحقق من الهوية..." : "Verifying identity..."}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex ${dark ? "bg-slate-900" : "bg-slate-50"}`}
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      {/* عرض شريط التنقل فقط إذا كان المستخدم مفعّل */}
      {role === "admin" || role === "doctor" ? (
        <Sidebar
          lang={lang}
          dark={dark}
          role={role}
          setScreen={setScreen}
          txt={txt}
        />
      ) : null}

      <main className="flex-1 overflow-y-auto">{renderScreen()}</main>
    </div>
  );
};

export default App;
